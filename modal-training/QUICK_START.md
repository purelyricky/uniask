# 🚀 Quick Start - Deploy in 10 Minutes

## Prerequisites (One-Time Setup)

```bash
# 1. Install Modal
pip install modal

# 2. Login to Modal
modal token new

# 3. Create Hugging Face secret
# Get token from: https://huggingface.co/settings/tokens
# Request access to: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
modal secret create huggingface-secret HF_TOKEN=your_hf_token_here
```

## Deploy Model (4 Commands)

```bash
# Navigate to modal-training directory
cd modal-training

# 1. Upload training data (30 seconds)
modal run 01_upload_data.py

# 2. Fine-tune model (1-2 hours on A100-80GB)
modal run 02_finetune_model.py

# 3. Deploy to production (30 seconds)
modal deploy 03_deploy_model.py

# 4. Copy the URL from output:
# https://your-username--unideb-ask-inference-unidebaskinference-chat.modal.run
```

## Configure Application

```bash
# In root directory, create .env.local
cd ..

# Add your Modal URL
echo "UNIDEB_MODAL_BASE_URL=https://your-username--unideb-ask-inference-unidebaskinference-chat.modal.run" >> .env.local
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key" >> .env.local
echo "TAVILY_API_KEY=your_tavily_key" >> .env.local

# Start app
bun dev
```

## Test

1. Open http://localhost:3000
2. Select "UnidebAsk (University Model)"
3. Ask: "How do I apply to University of Debrecen?"
4. Should get detailed answer with citations

Test refusal:
- Ask: "What's 2+2?"
- Should refuse politely and redirect to university topics

## Done! ✅

Your fine-tuned University of Debrecen model is live!

### Performance Specs:
- **Speed:** 100-300ms per response
- **Precision:** FP16 (no quantization)
- **Scope:** University of Debrecen ONLY
- **GPU:** A100-80GB
- **Cost:** ~$50-150/month

### Model Behavior:
✅ Answers: University questions (admissions, programs, fees, etc.)
❌ Refuses: Everything else (math, coding, other universities, etc.)

For detailed documentation, see `DEPLOYMENT_GUIDE.md`
