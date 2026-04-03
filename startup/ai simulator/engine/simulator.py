import json
import os

class TrainingSimulator:
    def __init__(self):
        # This finds your JSON file automatically, no matter where you run the script from
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, '..', 'data', 'gpu_specs.json')
        
        try:
            with open(json_path, 'r') as f:
                self.gpu_database = json.load(f)
        except FileNotFoundError:
            print(f"❌ Error: I looked for the file at {json_path} but couldn't find it.")
            self.gpu_database = {}

    def calculate_cost(self, model_params_billions, data_size_gb, gpu_name):
        gpu = self.gpu_database.get(gpu_name)
        if not gpu:
            return None

        # --- THE MATH ---
        # 1. Estimate Tokens (1GB text ≈ 0.2 Billion tokens)
        tokens_billions = data_size_gb * 0.2
        
        # 2. Total FLOPs = Params * Tokens * 6 (Factor of 6 for forward/backward pass)
        # Multiplied by 1e18 (Quintillion)
        total_flops = model_params_billions * tokens_billions * 6 * 1e18 

        # 3. Effective Speed = GPU FLOPS * 1 trillion * Efficiency (45%)
        effective_flops_per_sec = gpu['flops'] * 1e12 * 0.45
        
        # 4. Calculate Time & Cost
        seconds_needed = total_flops / effective_flops_per_sec
        hours_needed = seconds_needed / 3600
        
        price_normal = hours_needed * gpu['cost_on_demand']
        price_spot = hours_needed * gpu['cost_spot']

        return {
            "hours": round(hours_needed, 1),
            "cost_normal": round(price_normal, 2),
            "cost_spot": round(price_spot, 2),
            "savings": round(price_normal - price_spot, 2)
        }