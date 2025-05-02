import React, { useState } from 'react';
import DeleteModal from './modals/DeleteModal';

const Example = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Perform delete operation here
    console.log(`Deleting ${itemToDelete}`);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div>
      {/* Your other components */}
      
      {/* Example delete button */}
      <button onClick={() => handleDelete("Project Alpha")}>
        Delete Project
      </button>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={confirmDelete}
        itemName={itemToDelete}
      />
    </div>
  );
};

export default Example; 