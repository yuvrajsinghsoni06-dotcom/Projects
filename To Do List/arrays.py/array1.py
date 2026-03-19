import array as arr
a1 = arr.array('i', [1, 2, 3, 4, 5])
# print(a1)
# print(a1.typecode)
# print(len(a1))
# for i in range(0, len(a1)):
#     print(a1[i] , end=' ')

    #addtion of array
#append
new_array= arr.array('i' , [1,2,3,4,5,6,7])
# print(new_array)
# new_array.append(8)
# a1.append(9)
# print(new_array)
# print(a1)
# #insert
# a1.insert(2,100)
# print(a1)
# new_array.insert(5,200)
# print(new_array)
#deletion
# a1=a1.pop(2)
# print(a1)
# a1=a1.reverse()
# print(a1)
a2 = arr.array('i', sorted(new_array, reverse=True))
print(a2)
#slicing
print(a2[0:4])