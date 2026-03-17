def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
        # The 'else: continue' is not needed in Python, 
        # but it doesn't hurt logic.

    # MOVED OUTSIDE THE LOOP
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1
    
def Quick_sort(arr, low, high):
    if low < high:
        p_ind = partition(arr, low, high)

        # MOVED INSIDE THE IF BLOCK
        Quick_sort(arr, low, p_ind - 1)
        Quick_sort(arr, p_ind + 1, high)

# Usage
arr = [8, 2, 4, 7, 1, 3, 9, 6, 5]
Quick_sort(arr, 0, len(arr) - 1)
print(arr)