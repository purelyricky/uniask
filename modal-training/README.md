# University of Debrecen Custom Model Training & Deployment

## 📖 What's This?

This directory contains everything needed to train and deploy a **specialized Llama 3.1 8B model** that ONLY answers questions about the University of Debrecen. The model is fine-tuned to refuse all other topics and redirect users to university-related questions.

## 🎯 Key Features

### Model Characteristics
- **Base Model:** Llama 3.1 8B Instruct
- **Specialization:** University of Debrecen Q&A ONLY
- **Training Method:** LoRA fine-tuning with 5 epochs
- **Precision:** FP16 (no quantization for maximum speed)
- **Deployment:** Modal.com with A100-80GB GPU
- **Inference Speed:** 100-300ms per response

### Behavior
✅ **Answers:** University of Debrecen questions (admissions, programs, fees, etc.)
❌ **Refuses:** Everything else (politely redirects to university topics)

## 📁 Files Overview

```
modal-training/
├── training_data.jsonl         # Training examples (29 Q&A pairs + refusals)
├── 01_upload_data.py           # Upload training data to Modal
├── 02_finetune_model.py        # Fine-tune Llama 3.1 8B (FP16, no quantization)
├── 03_deploy_model.py          # Deploy to Modal with ultra-fast inference
├── try.py                      # Test script for deployed model
├── requirements.txt            # Python dependencies
├── QUICK_START.md             # 10-minute deployment guide
├── DEPLOYMENT_GUIDE.md        # Comprehensive deployment documentation
└── README.md                  # This file
```

## 🚀 Quick Start (10 Minutes)

### 1. Prerequisites
```bash
pip install modal
modal token new
```

### 2. Configure Hugging Face
```bash
# Get token: https://huggingface.co/settings/tokens
# Request access: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
modal secret create huggingface-secret HF_TOKEN=your_token_here
```

### 3. Deploy
```bash
# Upload training data
modal run 01_upload_data.py

# Fine-tune (1-2 hours)
modal run 02_finetune_model.py

# Deploy to production
modal deploy 03_deploy_model.py
```

### 4. Configure App
Add to `.env.local`:
```bash
UNIDEB_MODAL_BASE_URL=https://your-modal-url-here
```

See [QUICK_START.md](QUICK_START.md) for complete instructions.

## 🧪 Training Data

### Structure
Each training example is a JSON object with a messages array:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are 'UnidebAsk', a specialized AI assistant EXCLUSIVELY for the University of Debrecen..."
    },
    {
      "role": "user",
      "content": "How do I apply to University of Debrecen?"
    },
    {
      "role": "assistant",
      "content": "You can submit your application online via..."
    }
  ]
}
```

### Categories (29 Total Examples)
1. **University Q&A (19 examples):** Admissions, fees, programs, etc.
2. **Boundary Enforcement (10 examples):** Refusing non-university questions

### Key Training Principles
- **Strong System Prompt:** Enforced in every example
- **Refusal Examples:** Model learns to say "no" politely
- **Redirect Strategy:** Always suggest university-related alternatives
- **Consistency:** Same refusal pattern across all non-university topics

## ⚙️ Fine-Tuning Configuration

### Training Settings
```python
# Model: Llama 3.1 8B Instruct
# Precision: FP16 (no quantization)
# GPU: A100-80GB
# LoRA Rank: 32
# LoRA Alpha: 64
# Epochs: 5
# Batch Size: 16 (effective)
# Learning Rate: 5e-5
# Attention: Flash Attention 2
```

### Why These Settings?
- **No Quantization:** Maximum speed (university pays for costs)
- **Higher LoRA Rank (32):** Better quality adaptation
- **More Epochs (5):** Stronger boundary learning
- **FP16:** Fast inference without quality loss
- **Flash Attention:** 2-3x faster inference

## 🚀 Deployment Configuration

### Infrastructure
```python
# GPU: A100-80GB (for speed)
# Container: Always-on (1 hour idle timeout)
# Concurrency: 10 parallel requests
# Attention: Flash Attention 2
# Model: Merged (no LoRA overhead)
```

### Endpoints
- **GET /health:** Health check and model info
- **POST /chat:** Chat completion endpoint

### Request Format
```json
{
  "messages": [
    {"role": "user", "content": "Your question"}
  ],
  "max_tokens": 512,
  "temperature": 0.7
}
```

### Response Format
```json
{
  "response": "Model's answer",
  "time_seconds": 0.234,
  "model": "UnidebAsk Llama 3.1 8B"
}
```

## 🧪 Testing

### Test Script
```bash
# Update try.py with your Modal URL
python try.py
```

### Expected Results
1. **Health Check:** Returns model info
2. **University Question:** Detailed answer with sources
3. **General Question:** Polite refusal + redirect
4. **Other University:** Refusal + university alternative
5. **Tuition Fees:** Specific answer

### Success Criteria
✅ University questions answered correctly
✅ Non-university questions refused politely
✅ Response time < 1 second
✅ Proper redirection to university topics

## 💰 Cost Breakdown

### Training (One-Time)
- Fine-tuning: $2-5 per run (1-2 hours on A100-80GB)
- Re-training: Only when updating data

### Inference (Ongoing)
- Active usage: ~$1-2 per hour (A100-80GB)
- Idle timeout: Container scales to zero after 1 hour
- **Monthly estimate:** $50-150 (depending on usage)

### Cost Optimization
Since the university pays, we prioritize **SPEED over cost**:
- No quantization (fastest inference)
- Premium GPU (A100-80GB)
- Flash Attention 2
- Merged weights (no LoRA overhead)

## 🔧 Troubleshooting

### Model Answers General Questions
**Problem:** Fine-tuning didn't learn boundaries properly

**Solution:**
1. Check `training_data.jsonl` has enough refusal examples
2. Ensure system prompt is consistent across all examples
3. Increase epochs or LoRA rank
4. Re-run fine-tuning

### Slow Responses (>1 second)
**Problem:** Suboptimal deployment configuration

**Solution:**
1. Verify merged model is being used (not LoRA adapters)
2. Check Flash Attention 2 is enabled
3. Ensure A100-80GB GPU is allocated
4. Monitor Modal logs for issues

### "No Model Found" Error
**Problem:** Fine-tuning incomplete or failed

**Solution:**
```bash
# Check Modal volume
modal volume ls unideb-llama-finetuned

# Re-run fine-tuning
modal run 02_finetune_model.py
```

### Model Not in Dropdown
**Problem:** Environment variable not set

**Solution:**
1. Add `UNIDEB_MODAL_BASE_URL` to `.env.local`
2. Restart dev server
3. Clear browser cache

## 📚 Documentation

- [QUICK_START.md](QUICK_START.md) - Get running in 10 minutes
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment documentation
- [try.py](try.py) - Test script with examples

## 🔄 Updating the Model

### Add New Training Data
1. Edit `training_data.jsonl`
2. Add new Q&A examples (same format)
3. Re-upload: `modal run 01_upload_data.py`
4. Re-train: `modal run 02_finetune_model.py`
5. Re-deploy: `modal deploy 03_deploy_model.py`

### Adjust Training Parameters
Edit `02_finetune_model.py`:
- Increase `num_epochs` for stronger learning
- Increase `r` (LoRA rank) for better quality
- Adjust `learning_rate` for stability

## 🔐 Security & Privacy

- **No API Key Required:** Modal endpoint is public but usage-based billing
- **Domain Restriction:** Model trained to only answer university questions
- **Private Data:** Training data contains only public university information
- **Rate Limiting:** Automatic via Modal infrastructure

## ✅ Success Checklist

Before going to production:

- [ ] Fine-tuning completed successfully
- [ ] Merged model saved to Modal volume
- [ ] Model deployed and endpoints accessible
- [ ] Health check returns correct model info
- [ ] University questions answered accurately
- [ ] Non-university questions refused politely
- [ ] Response time < 1 second
- [ ] Model appears in app dropdown
- [ ] Environment variable configured
- [ ] Integration tested end-to-end

## 🎉 Result

A **blazing-fast, university-specific AI model** that:
- Answers University of Debrecen questions with high accuracy
- Refuses all other topics politely
- Responds in <1 second
- Runs on premium infrastructure (A100-80GB)
- Costs $50-150/month (fully managed by university)

Users get the best of both worlds:
1. **UnidebAsk Model:** Ultra-fast, specialized, accurate for university questions
2. **Gemini Fallback:** General-purpose option if needed

---

**Questions?** Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting.
