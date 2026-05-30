# def gen_value():
#     yield 1
#     yield 2
#     yield 3

# if __name__ == "__main__":
#     gen_values_obj = gen_value()
#     for value in gen_values_obj:
#         print(value)

# def prime(start , end):
#     primes = []
#     for num in range(start , end +1):
#         if num < 2:
#             continue
#         is_prime = True
#         for i in range(2,num):
#             if num % i ==0:
#                 is_prime = False
#                 break
#         if is_prime:
#             primes.append(num)
#     return primes


# a =prime(10,50)
# print(a)


# def gen_prime(start , end):
#     for num in range(start , end +1):
#         if num < 2:
#             continue
#         is_prime = True
#         for i in range(2,num):
#             if num % i ==0:
#                 is_prime = False
#                 break
#         if is_prime:
#             yield num

# if __name__ == "__main__":
#     prime_gen = gen_prime(10,50)
#     for prime in prime_gen:
#         print(prime)
# import random 
# def gen_simulate_data(n : int):
#     for _ in range(n):
#      service = ["Compute","Storage", "Database" ,"AI" ,"Network"]
#      cost = random.randint(100,1000)
#      yield {"Service" : random.choice(service) , "Cost" : f"${cost}"} 

# if __name__ == "__main__":
#     a = gen_simulate_data(7)
#     # print(next(a))
#     for i in range(5):
#         print(next(a))

import random
  # generators does stores the value they just provide the value thats all
def gen_anomalies(n: int):
    # Moved outside the loop for memory efficiency 
    anomalies_list = ["High_Cpu_Usage", "Memory_leak", "Network_Latency", "Disk_Failure", "Unauthorized_Access"]
    threshold = 10000

    for _ in range(n):
        # 1. Draw the relationship: Pick one anomaly and one cost per iteration
        selected_anomaly = random.choice(anomalies_list)
        cost = random.randint(5000, 15000)
        
        # 2. Check if the generated cost exceeds the threshold
        if cost > threshold:
            # Yield them together as a mapped dictionary
            yield {"Anomaly": selected_anomaly, "Cost": f"${cost}"}


if __name__ == "__main__":
    n = int(input("Enter the number of simulated logs: "))
    a = gen_anomalies(n)
    
    # 3. Use a standard 'for...in' loop instead of next()
    # This automatically stops when the generator runs out, preventing StopIteration errors!
    print("\n--- High Cost Anomalies Detected ---")
    for item in a:
        print(item)




