"""
Ultra-Fast Deployment - University of Debrecen Model
Optimized for MAXIMUM SPEED with always-on container
"""
import modal
from typing import List, Literal
from pydantic import BaseModel

app = modal.App("unideb-ask-inference")

model_volume = modal.Volume.from_name("unideb-llama-finetuned", create_if_missing=True)

# Ultra-fast inference image
inference_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "numpy<2.0",
        "torch==2.4.0",
        "transformers==4.44.2",
        "accelerate==0.33.0",
        "fastapi[standard]==0.115.4",
        "pydantic==2.7.1",
        "huggingface_hub",
    )
)


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    max_tokens: int = 512
    temperature: float = 0.7


class ChatResponse(BaseModel):
    response: str
    time_seconds: float
    model: str


@app.cls(
    image=inference_image,
    gpu="A100-80GB",  # Fast GPU for fp16 inference
    volumes={"/model": model_volume},
    scaledown_window=3600,  # Keep alive 1 hour (renamed from container_idle_timeout)
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
@modal.concurrent(max_inputs=10)  # Handle 10 concurrent requests (replaces allow_concurrent_inputs)
class UnidebAskInference:

    @modal.enter()
    def load_model(self):
        """Load model ONCE when container starts (happens only at startup)"""
        import torch
        from pathlib import Path
        from transformers import AutoModelForCausalLM, AutoTokenizer

        print("=" * 80)
        print("LOADING UNIVERSITY OF DEBRECEN MODEL")
        print("=" * 80)

        model_path = Path("/model/unideb-llama-3.1-8b-finetuned/merged_model")

        if not model_path.exists():
            model_path = Path("/model/unideb-llama-3.1-8b-finetuned/lora_adapters")
            if not model_path.exists():
                raise FileNotFoundError("No model found! Run fine-tuning first.")

        print(f"Loading from: {model_path}")

        self.tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        self.tokenizer.pad_token = self.tokenizer.eos_token
        self.tokenizer.padding_side = "left"

        # Load model with FP16 for speed (same as training)
        self.model = AutoModelForCausalLM.from_pretrained(
            str(model_path),
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )

        self.model.eval()
        print("Model loaded in FP16 with eager attention")

        # University-specific system prompt
        self.SYSTEM_PROMPT = (
            "You are 'UnidebAsk', a specialized AI assistant EXCLUSIVELY for the "
            "University of Debrecen. You MUST ONLY answer questions about the University "
            "of Debrecen. For ANY other topic, politely refuse and redirect to "
            "university-related topics."
        )

        print("Model loaded and ready!")
        print("Optimized for: University of Debrecen Q&A")
        print("=" * 80)

    @modal.fastapi_endpoint(method="GET")  # Renamed from web_endpoint
    def health(self):
        """Health check endpoint"""
        return {
            "status": "ready",
            "model": "UnidebAsk Llama 3.1 8B",
            "mode": "ULTRA-FAST (FP16)",
            "optimized_for": "University of Debrecen",
        }

    @modal.fastapi_endpoint(method="POST")  # Renamed from web_endpoint
    def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Chat endpoint - uses pre-loaded model for instant responses

        The model is fine-tuned to ONLY answer University of Debrecen questions.
        """
        import torch
        import time

        start = time.time()

        # Enforce system prompt
        messages = [{"role": "system", "content": self.SYSTEM_PROMPT}]

        # Add user messages (skip any system messages from request)
        for m in request.messages:
            if m.role != "system":
                messages.append({"role": m.role, "content": m.content})

        # Generate response
        formatted = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = self.tokenizer(formatted, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                do_sample=request.temperature > 0,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                use_cache=True,
                repetition_penalty=1.1,
            )

        response = self.tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:],
            skip_special_tokens=True,
        ).strip()

        elapsed = time.time() - start

        return ChatResponse(
            response=response,
            time_seconds=round(elapsed, 3),
            model="UnidebAsk Llama 3.1 8B"
        )


@app.local_entrypoint()
def main():
    print("\n" + "=" * 80)
    print("DEPLOYING UNIVERSITY OF DEBRECEN MODEL")
    print("=" * 80)
    print("\nConfiguration:")
    print("  - Model: Llama 3.1 8B Fine-tuned")
    print("  - Precision: FP16 (maximum speed)")
    print("  - GPU: A100-80GB")
    print("  - Attention: Eager (Flash if available)")
    print("  - Purpose: University of Debrecen Q&A ONLY")
    print("\nDeploying...")