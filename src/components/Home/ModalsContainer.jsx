import React, { memo } from 'react';
import AddLeadModal from '../AddLead';
import UnifiedCallModal from '../UnifiedCallModel'; 
import WatsaapChat from '../WatsaapChat';
import AssignedLeadManually from '../AssignedLeadManually';

const ModalsContainer = memo(({
  isAddLeadModalOpen,
  isDisconnectPopupOpen,
  isConnectedPopupOpen,
  isAssignedtoL2,
  isAssignedtoL3,
  openChatModal,
  selectedStudent,
  agentId,
  onCloseAddLead,
  onAddLeadSuccess,
  onCloseDisconnect,
  onCloseConnected,
  onCloseAssignedL2,
  onCloseAssignedL3,
  onCloseWhatsApp
}) => {
  return (
    <>
      <AddLeadModal
        agentID={agentId}
        isOpen={isAddLeadModalOpen}
        onClose={onCloseAddLead}
        onSuccess={onAddLeadSuccess}
      />

      {(isDisconnectPopupOpen || isConnectedPopupOpen) && selectedStudent && (
        <UnifiedCallModal
          isOpen={isDisconnectPopupOpen || isConnectedPopupOpen}
          onClose={isDisconnectPopupOpen ? onCloseDisconnect : onCloseConnected}
          selectedStudent={selectedStudent}
          isConnectedCall={isConnectedPopupOpen} 
        />
      )}

      {isAssignedtoL2 && selectedStudent && (
        <AssignedLeadManually
          isAssignedtoL2={isAssignedtoL2}
          setIsAssignedtoL2={onCloseAssignedL2}
          selectedStudent={selectedStudent}
          setIsAssignedtoL3={onCloseAssignedL3}
        />
      )}

      {isAssignedtoL3 && selectedStudent && (
        <AssignedLeadManually
          isAssignedtoL3={isAssignedtoL3}
          setIsAssignedtoL3={onCloseAssignedL3}
          setIsAssignedtoL2={onCloseAssignedL2}
          selectedStudent={selectedStudent}
        />
      )}

      {openChatModal && selectedStudent && (
        <WatsaapChat
          setOpenwhatsappPopup={onCloseWhatsApp}
          student={selectedStudent}
        />
      )}
    </>
  );
});
export default ModalsContainer;
