import React from "react";
import Modal from "../../common/Modal";

const UserDetailsModal = ({ isOpen, onClose, user, displayStatus }) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title="User Details"
      confirmText="Close"
      cancelText=""
    >
      <div className="space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold">
            {user.counsellor_name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.counsellor_name}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.counsellor_email}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium">{user.role || "N/A"}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{displayStatus(user)}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">Preferred Mode</p>
            <p className="font-medium">{user.preferredMode || "Regular"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">
              {user.created_at
                ? new Date(user.created_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailsModal;