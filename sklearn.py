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


def gen_prime(start , end):
    for num in range(start , end +1):
        if num < 2:
            continue
        is_prime = True
        for i in range(2,num):
            if num % i ==0:
                is_prime = False
                break
        if is_prime:
            yield num

if __name__ == "__main__":
    prime_gen = gen_prime(10,50)
    for prime in prime_gen:
        print(prime)

