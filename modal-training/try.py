"""
Test script for University of Debrecen custom model
Replace YOUR_MODAL_URL with your actual deployment URL
"""
import requests
import json

# IMPORTANT: Replace with your actual Modal deployment URL
BASE_URL = "https://gurvesandrew--unideb-ask-inference-unidebaskinference-chat.modal.run"
# Example: "https://your-username--unideb-ask-inference-unidebaskinference-chat.modal.run"

def test_health():
    """Test health endpoint"""
    print("=" * 80)
    print("TESTING HEALTH ENDPOINT")
    print("=" * 80)

    # Health check uses GET method
    health_url = BASE_URL.replace("/chat", "/health")
    response = requests.get(health_url)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_university_question():
    """Test with valid university question"""
    print("=" * 80)
    print("TEST 1: UNIVERSITY QUESTION (Should Answer)")
    print("=" * 80)

    response = requests.post(
        BASE_URL,
        json={
            "messages": [
                {"role": "user", "content": "How do I apply to University of Debrecen?"}
            ],
            "max_tokens": 300,
            "temperature": 0.7
        }
    )

    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result['response']}")
    print(f"Time: {result['time_seconds']}s")
    print(f"Model: {result['model']}")
    print()

def test_general_question():
    """Test with non-university question (should refuse)"""
    print("=" * 80)
    print("TEST 2: GENERAL QUESTION (Should Refuse)")
    print("=" * 80)

    response = requests.post(
        BASE_URL,
        json={
            "messages": [
                {"role": "user", "content": "What's 2+2?"}
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }
    )

    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result['response']}")
    print(f"Time: {result['time_seconds']}s")
    print()

def test_other_university():
    """Test with question about another university (should refuse)"""
    print("=" * 80)
    print("TEST 3: OTHER UNIVERSITY (Should Refuse)")
    print("=" * 80)

    response = requests.post(
        BASE_URL,
        json={
            "messages": [
                {"role": "user", "content": "Tell me about Harvard University"}
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }
    )

    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result['response']}")
    print(f"Time: {result['time_seconds']}s")
    print()

def test_tuition_fees():
    """Test with specific university question"""
    print("=" * 80)
    print("TEST 4: TUITION FEES QUESTION")
    print("=" * 80)

    response = requests.post(
        BASE_URL,
        json={
            "messages": [
                {"role": "user", "content": "What are the tuition fees at University of Debrecen?"}
            ],
            "max_tokens": 300,
            "temperature": 0.7
        }
    )

    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result['response']}")
    print(f"Time: {result['time_seconds']}s")
    print()

if __name__ == "__main__":
    if "YOUR_MODAL_URL" in BASE_URL:
        print("ERROR: Please update BASE_URL with your actual Modal deployment URL!")
        print("\nGet your URL from:")
        print("  modal deploy modal-training/03_deploy_model.py")
        print("\nThen update BASE_URL in this file.")
        exit(1)

    try:
        test_health()
        test_university_question()
        test_general_question()
        test_other_university()
        test_tuition_fees()

        print("=" * 80)
        print("ALL TESTS COMPLETED")
        print("=" * 80)
        print("\n✅ If the model:")
        print("  - Answered university questions correctly")
        print("  - Refused non-university questions politely")
        print("  - Responded in <1 second")
        print("\nThen your model is working perfectly!")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ ERROR: {e}")
        print("\nMake sure:")
        print("  1. BASE_URL is correct")
        print("  2. Model is deployed (modal deploy 03_deploy_model.py)")
        print("  3. You have internet connection")
