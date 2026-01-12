import React from "react";
import { UserX } from "lucide-react";
import Modal from "../../common/Modal";

const DisableUserModal = ({ isOpen, onClose, onConfirm, user }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={user?.status === "inactive" ? "Confirm Enable" : "Confirm Disable"}
      icon={UserX}
      iconColor="orange"
      confirmColor="orange"
    >
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {user?.status === "inactive" ? "Enable User" : "Disable User"}
        </h3>
        <p className="text-gray-500">
          Are you sure you want to
          {user?.status === "inactive" ? " enable " : " disable "}
          user <span className="font-medium">{user?.name}</span>?
          {user?.status === "inactive"
            ? " They will be able to access the system again."
            : " They will no longer be able to access the system."}
        </p>
      </div>
    </Modal>
  );
};

export default DisableUserModal;