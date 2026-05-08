# # def partition(arr, low, high):
# #     pivot = arr[high]
# #     i = low - 1
    
# #     for j in range(low, high):
# #         if arr[j] <= pivot:
# #             i += 1
# #             arr[i], arr[j] = arr[j], arr[i]
# #         # The 'else: continue' is not needed in Python, 
# #         # but it doesn't hurt logic.

# #     # MOVED OUTSIDE THE LOOP
# #     arr[i+1], arr[high] = arr[high], arr[i+1]
# #     return i + 1
    
# # def Quick_sort(arr, low, high):
# #     if low < high:
# #         p_ind = partition(arr, low, high)

# #         # MOVED INSIDE THE IF BLOCK
# #         Quick_sort(arr, low, p_ind - 1)
# #         Quick_sort(arr, p_ind + 1, high)

# # # Usage
# # arr = [18, 12, 14, 17, 11, 13, 19, 16, 15]
# # Quick_sort(arr, 0, len(arr) - 1)
# # print(arr)


# def Partition(arr,low,high):
#     pivot = arr[high]
#     i = low - 1

#     for j in range(low,high):
#         if arr[j] <= pivot:
#             i +=1
#             arr[i],arr[j] = arr[j], arr[i]

        
#     arr[i+1],arr[high] = arr[high],arr[i+1]
#     return i+1

# def Quicksort(arr,low,high):
#     if low < high:
#         p_index = Partition(arr,low,high)

#         Quicksort(arr,low,p_index - 1)
#         Quicksort(arr,p_index + 1,high)

# arr = [99,87,45,67,35,100,97]
# Quicksort(arr,0,len(arr) - 1)
# print(arr)


# class Partititon:
#     def __init__(self,arr,low,high):
#         self.pivot = arr[high]
#         self.point = low - 1

#     def part(self,low,high):

