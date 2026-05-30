class PointerQueue:
    def __init__(self):
        self.storage = [] # The underlying list
        self.head = 0     # Index of the front element
        self.tail = 0     # Index of the next open slot
        
    def enqueue(self, val):
        """
        Add an element to the end (tail) of the queue.
        Time Complexity: O(1)
        """
        self.storage.append(val)
        self.tail += 1
        
    def dequeue(self):
        """
        Return the element at the head and move the head pointer forward.
        Time Complexity: O(1) - Because we are NOT shifting elements.
        """
        if self.is_empty():
            return None
        
        # Retrieve data at the current head pointer
        data = self.storage[self.head]
        
        # Move the head pointer to the next item
        self.head += 1
        
        # Optional: Garbage collection (in a real low-level language, 
        # you might explicitly free memory here, but in Python, 
        # we usually just leave it or overwrite it in a circular buffer).
        
        return data
        
    def is_empty(self):
        """
        The queue is empty if the head pointer has caught up to the tail.
        """
        return self.head >= self.tail

def bfs_with_pointer_queue(graph, start_node):
    # 1. Initialize our custom Queue
    queue = PointerQueue()
    queue.enqueue(start_node)
    
    # 2. Track visited nodes to prevent cycles
    visited = set()
    visited.add(start_node)
    
    print(f"--- Starting BFS from '{start_node}' ---")
    
    # 3. Process the queue until Head meets Tail
    while not queue.is_empty():
        # Dequeue using our pointer logic
        current_node = queue.dequeue()
        print(f"Processed Node: {current_node}")
        
        # Check all neighbors
        for neighbor in graph.get(current_node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)

# --- Driver Code ---
if __name__ == "__main__":
    # Graph represented as an Adjacency List (Dictionary)
    my_graph = {
        0: [1, 2],
        1: [0, 3, 4],
        2: [0, 4],
        3: [1],
        4: [1, 2]
    }

    bfs_with_pointer_queue(my_graph, 0)