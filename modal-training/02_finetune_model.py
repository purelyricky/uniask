"""
Modal fine-tuning script - Optimized for SPEED (No quantization)
Full precision training for maximum inference speed
"""

import modal

app = modal.App("unideb-llama-finetune")

data_volume = modal.Volume.from_name("unideb-llama-training-data", create_if_missing=True)
model_volume = modal.Volume.from_name("unideb-llama-finetuned", create_if_missing=True)

gpu_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .pip_install(
        "numpy<2.0",
        "torch==2.4.0",
        "transformers==4.44.2",
        "datasets==2.20.0",
        "peft==0.12.0",
        "accelerate==0.33.0",
        "trl==0.9.6",
        "huggingface_hub",
        "scipy",
    )
)


@app.function(
    image=gpu_image,
    gpu="A100-80GB",  # Larger GPU for full precision training
    volumes={
        "/data": data_volume,
        "/model": model_volume,
    },
    timeout=10800,  # 3 hours timeout for full precision training
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
def finetune_llama():
    import json
    import os
    from pathlib import Path
    import torch
    from datasets import Dataset
    from peft import LoraConfig, get_peft_model
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        TrainingArguments,
    )
    from trl import SFTTrainer

    print("=" * 80)
    print("STARTING LLAMA 3.1 8B FINE-TUNING (FULL PRECISION FOR SPEED)")
    print("=" * 80)

    data_path = Path("/data/training_data.jsonl")
    output_dir = Path("/model/unideb-llama-3.1-8b-finetuned")
    output_dir.mkdir(exist_ok=True, parents=True)

    print(f"\nLoading training data from {data_path}")
    samples = []
    with open(data_path, "r", encoding="utf-8") as f:
        for line in f:
            samples.append(json.loads(line))

    print(f"Loaded {len(samples)} training samples")

    model_id = "meta-llama/Llama-3.1-8B-Instruct"

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        token=os.environ.get("HF_TOKEN"),
        trust_remote_code=True,
    )
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # Load model in FULL PRECISION (fp16 for speed without quality loss)
    print("\nLoading model in FP16 (no quantization) for maximum speed...")

    # Try to use Flash Attention 2, fall back to eager if unavailable
    try:
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,  # FP16 for speed
            device_map="auto",
            token=os.environ.get("HF_TOKEN"),
            trust_remote_code=True,
            use_cache=False,
            attn_implementation="flash_attention_2",  # Ultra-fast attention
        )
        print("Using Flash Attention 2 for maximum speed")
    except Exception as e:
        print(f"Flash Attention 2 not available ({e}), using eager attention")
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            token=os.environ.get("HF_TOKEN"),
            trust_remote_code=True,
            use_cache=False,
        )

    # LoRA configuration - larger rank for better quality
    lora_config = LoraConfig(
        r=32,  # Increased rank for better adaptation
        lora_alpha=64,
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    # Enable gradient checkpointing for LoRA models
    model.enable_input_require_grads()

    def format_chat_template(sample):
        messages = sample["messages"]
        return {"text": tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)}

    dataset = Dataset.from_list(samples)
    dataset = dataset.map(format_chat_template, remove_columns=dataset.column_names)

    training_args = TrainingArguments(
        output_dir=str(output_dir / "checkpoints"),
        num_train_epochs=5,  # More epochs for better learning
        per_device_train_batch_size=2,  # Smaller batch for fp16
        gradient_accumulation_steps=8,  # Effective batch size = 16
        gradient_checkpointing=True,
        gradient_checkpointing_kwargs={"use_reentrant": False},  # Required for LoRA
        optim="adamw_torch",  # Standard AdamW (no 8-bit)
        learning_rate=5e-5,  # Lower LR for stability
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
        logging_steps=5,
        save_strategy="epoch",
        save_total_limit=2,
        fp16=True,  # FP16 for speed
        bf16=False,
        max_grad_norm=1.0,
        report_to="none",
        push_to_hub=False,
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        tokenizer=tokenizer,
        max_seq_length=2048,
        dataset_text_field="text",
        packing=False,
    )

    print("\nStarting training...")
    trainer.train()
    print("\nTraining complete!")

    # Save LoRA adapters
    print("\nSaving LoRA adapters...")
    trainer.model.save_pretrained(str(output_dir / "lora_adapters"))
    tokenizer.save_pretrained(str(output_dir / "lora_adapters"))

    # IMPORTANT: Merge LoRA weights into base model for MAXIMUM SPEED
    print("\nMerging LoRA weights into base model for fastest inference...")

    # Load base model in fp16
    try:
        base_model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            token=os.environ.get("HF_TOKEN"),
            attn_implementation="flash_attention_2",
        )
    except Exception:
        base_model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            token=os.environ.get("HF_TOKEN"),
        )

    # Load and merge LoRA weights
    from peft import PeftModel
    peft_model = PeftModel.from_pretrained(base_model, str(output_dir / "lora_adapters"))
    merged_model = peft_model.merge_and_unload()

    # Save merged model
    print("Saving merged model for deployment...")
    merged_model.save_pretrained(str(output_dir / "merged_model"))
    tokenizer.save_pretrained(str(output_dir / "merged_model"))

    info = {
        "model_id": model_id,
        "num_samples": len(samples),
        "num_epochs": training_args.num_train_epochs,
        "lora_r": lora_config.r,
        "precision": "fp16",
        "merged": True,
        "optimized_for": "maximum_speed",
        "status": "completed",
    }

    with open(output_dir / "training_info.json", "w") as f:
        json.dump(info, f, indent=2)

    model_volume.commit()

    print("\nModel trained and merged successfully!")
    print("Ready for ultra-fast inference with NO quantization overhead!")
    return info


@app.local_entrypoint()
def main():
    print("Starting FULL PRECISION Llama 3.1 8B fine-tuning...")
    print("University pays = Maximum speed, no compromises!")
    result = finetune_llama.remote()

    print("\n" + "=" * 80)
    print("FINE-TUNING COMPLETED!")
    print("=" * 80)
    print(f"\nOptimized merged model ready for FASTEST inference")
    print(f"Precision: {result['precision']}")
    print(f"Samples: {result['num_samples']}")
    print(f"Epochs: {result['num_epochs']}")
    print(f"Status: {result['status']}")
    print("\nNext: Deploy with 03_deploy_model.py")


if __name__ == "__main__":
    main()