import React from "react";
import { LogOut } from "lucide-react";
import Modal from "../../common/Modal";

const LogoutUserModal = ({ isOpen, onClose, onConfirm, user }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirm Logout"
      icon={LogOut}
      iconColor="orange"
      confirmColor="orange"
    >
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Logout User
        </h3>
        <p className="text-gray-500">
          Are you sure you want to logout user{" "}
          <span className="font-medium">{user?.counsellor_name}</span>? This
          will end their current session.
        </p>
      </div>
    </Modal>
  );
};

export default LogoutUserModal;