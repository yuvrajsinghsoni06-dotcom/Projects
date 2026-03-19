# def fibo():
#     num = int(input("enter your digit: "))
#     a = 0
#     b = 1
#     for i in range(num):
#         print(a)
#         a , b = b , a + b
# fibo()

#through recurssion:
# def fibo(n):
#     if n == 0:
#         return 0
#     elif n == 1:
#         return 1
#     else:
#         return fibo(n-1) + fibo(n-2)

# # --- These lines must be outside the function ---
# terms = 10
# for i in range(terms):
#     print(fibo(i), end=" ")

#array:
# def fibo_array(n):
#     # Step 1: Handle edge cases (if user wants 0 or 1 term)
#     if n <= 0:
#         return []
#     elif n == 1:
#         return [0]

#     # Step 2: Initialize the list with the first two numbers
#     fib_sequence = [0, 1]

#     # Step 3: Loop from 2 up to n
#     # We start at 2 because we already have the 0th and 1st index
#     for i in range(2, n):
#         # Calculate next number: sum of the previous two
#         next_number = fib_sequence[i-1] + fib_sequence[i-2]
        
#         # Add it to the list
#         fib_sequence.append(next_number)

#     return fib_sequence

# # --- Main Program ---
# terms = 10
# result = fibo_array(terms)

# # Print the list cleanly
# print(*result)
from dataclasses import dataclass

@dataclass
class Series:  # Class names usually start with a Capital letter
    number: int

    def fibonacci(self):
        # Edge cases
        if self.number <= 0:
            return []
        elif self.number == 1:
            return [0]
        
        # Array logic
        fibo_sequence = [0, 1]
        for i in range(2, self.number):
            next_number = fibo_sequence[i-1] + fibo_sequence[i-2]
            fibo_sequence.append(next_number)
            
        return fibo_sequence  # <--- FIXED: Added return statement

    def __repr__(self):
        # FIXED: Call the method to show the list, avoiding infinite recursion
        return f"Fibonacci series of {self.number} is {self.fibonacci()}"

# --- Execution ---
obj = Series(10)

# This now works because the function returns the list
print(obj.fibonacci()) 
# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# This also works now (uses the fixed __repr__)
print(obj) 
# Output: Fibonacci series of 10 is [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
