from engine.simulator import TrainingSimulator

# Initialize
sim = TrainingSimulator()

print("--- 🧪 TESTING YOUR PRODUCT ---")

# Let's pretend a user wants to train a 7 Billion Parameter model on 50GB of data
result = sim.calculate_cost(7.0, 50.0, "NVIDIA A100 (80GB)")

if result:
    print(f"✅ SUCCESS! Calculation complete.")
    print(f"⏱️  Time: {result['hours']} Hours")
    print(f"💰 Cost: ${result['cost_normal']}")
    print(f"📉 Spot Savings: ${result['savings']}")
else:
    print("❌ FAILED. Could not calculate.")