import React from "react";
import Modal from "../../common/Modal";

const ChangeRoleModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  selectedRole,
  setSelectedRole
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Change User Role"
      confirmText="Update Role"
    >
      <div className="space-y-4">
        <p className="text-gray-500 mb-4">
          Change role for user:{" "}
          <span className="font-medium">{user?.name}</span>
        </p>
        <div>
          <label
            htmlFor="roleSelect"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Role
          </label>
          <select
            id="roleSelect"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value="l2">Level 2 (L2)</option>
            <option value="l3">Level 3 (L3)</option>
          </select>
        </div>
        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
          <p className="font-medium mb-1">Role Information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>L2:</strong> Standard agent permissions
            </li>
            <li>
              <strong>L3:</strong> Enhanced agent permissions with additional
              capabilities
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeRoleModal;