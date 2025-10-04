"""
Modal script to upload training data to Modal Volumes
This script uploads the training dataset to Modal's persistent storage
"""

import modal
from pathlib import Path
import json

# Create Modal app
app = modal.App("unideb-ask-upload-data")

# Create a volume to store training data
volume = modal.Volume.from_name("unideb-llama-training-data", create_if_missing=True)

# Define image with required dependencies
image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "datasets",
    "huggingface_hub",
)


@app.function(
    image=image,
    volumes={"/data": volume},
    timeout=3600,  # 1 hour timeout
)
def upload_training_data(file_content: bytes):
    """
    Upload training data to Modal volume
    """
    import json
    from pathlib import Path

    # Path in Modal volume
    data_dir = Path("/data")
    data_dir.mkdir(exist_ok=True, parents=True)

    # Destination file path
    destination = data_dir / "training_data.jsonl"
    
    print(f"Processing uploaded data...")

    # Parse and validate the data
    samples = []
    lines = file_content.decode('utf-8').splitlines()
    
    for i, line in enumerate(lines):
        try:
            sample = json.loads(line)
            if "messages" not in sample:
                print(f"Warning: Line {i + 1} missing 'messages' field")
                continue
            samples.append(sample)
        except json.JSONDecodeError as e:
            print(f"Error parsing line {i + 1}: {e}")
            continue

    print(f"Validated {len(samples)} training samples")

    # Write to volume
    with open(destination, "w", encoding="utf-8") as f:
        for sample in samples:
            f.write(json.dumps(sample) + "\n")

    # Commit the volume changes
    volume.commit()

    print(f"Successfully uploaded {len(samples)} samples to {destination}")
    print(f"Volume committed successfully")

    return {
        "total_samples": len(samples),
        "destination": str(destination),
        "status": "success",
    }


@app.function(
    image=image,
    volumes={"/data": volume}
)
def verify_upload():
    """Verify uploaded data structure"""
    from pathlib import Path
    import json
    
    data_path = Path("/data")
    
    print("=== Data Verification ===")
    print(f"\nFiles in /data:")
    for item in data_path.iterdir():
        if item.is_file():
            print(f"  {item.name} ({item.stat().st_size / 1024:.2f} KB)")
        elif item.is_dir():
            file_count = len(list(item.glob("*")))
            print(f"  {item.name}/ ({file_count} files)")
    
    # Check training data file
    training_file = data_path / "training_data.jsonl"
    if training_file.exists():
        line_count = 0
        with open(training_file, 'r') as f:
            for _ in f:
                line_count += 1
        print(f"\ntraining_data.jsonl: {line_count} samples ({training_file.stat().st_size / 1024:.2f} KB)")
    else:
        print("\ntraining_data.jsonl: NOT FOUND")


@app.local_entrypoint()
def main(data_path: str = r"C:\Users\Window\Desktop\modal-training\training_data.jsonl"):
    """
    Main entry point for uploading data
    
    Usage:
        modal run 01_upload_data.py
        modal run 01_upload_data.py --data-path /path/to/your/training_data.jsonl
    """
    local_file = Path(data_path)
    
    if not local_file.exists():
        print(f"Error: Training data file not found: {local_file}")
        return
    
    print("="*60)
    print(f"Uploading data from: {local_file}")
    print(f"File size: {local_file.stat().st_size / 1024:.2f} KB")
    print("="*60)
    
    # Read file content
    with open(local_file, 'rb') as f:
        file_content = f.read()
    
    # Upload to Modal
    print("\nStarting upload to Modal volume...")
    result = upload_training_data.remote(file_content)
    
    print("\n=== Upload Complete ===")
    print(f"Status: {result['status']}")
    print(f"Total samples: {result['total_samples']}")
    print(f"Destination: {result['destination']}")
    
    # Verify the upload
    print("\nVerifying upload...")
    verify_upload.remote()
    
    print("\nYou can now proceed to fine-tuning!")


if __name__ == "__main__":
    main()
