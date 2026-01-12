import { ToggleLeft } from "lucide-react";
import Modal from "../../common/Modal";

const PreferredModeModal = ({ isOpen, onClose, onConfirm, user }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Toggle Preferred Mode"
      icon={ToggleLeft}
      iconColor="blue"
      confirmColor="blue"
    >
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Change Preferred Mode
        </h3>
        <p className="text-gray-500">
          Are you sure you want to change the preferred mode for user
          <span className="font-medium"> {user?.counsellor_name}</span> from
          <span className="font-medium"> {user?.counsellor_preferred_mode || "Regular"}</span> to
          <span className="font-medium"> {user?.counsellor_preferred_mode === "Online" ? "Regular" : "Online"}</span>?
        </p>
        <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-600">
          <p className="font-medium mb-1">Mode Information:</p>
          <ul className="list-disc pl-5 space-y-1 text-left">
            <li>
              <strong>Regular:</strong> Standard assignment mode
            </li>
            <li>
              <strong>Online:</strong> Online assignment mode with additional capabilities
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default PreferredModeModal;