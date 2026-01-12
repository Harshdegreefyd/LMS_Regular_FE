import React, { memo } from 'react';
import TableContent from '../TableContent';
import Pagination from '../Pagination';

const LeadsTable = memo(({
  loading,
  leads,
  activeRole,
  totalPages,
  currentPage,
  leadsPerPage,
  totalLeads,
  filters,
  onPageChange,
  onConnect,
  onDisconnect,
  onWhatsApp,
  onAssignedtoL2,
  onAssignedtoL3,
  activeTab,
  handleFilterChange,
  setCallbackType,
  callbackType,
  onLimitChange // Add this line

}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-y-scroll custom-scrollbar">
        <TableContent
          loading={loading}
          leadsdata={leads}
          activeRole={activeRole}
          handleConnect={onConnect}
          handleDisconnect={onDisconnect}
          setOpenChatModel={onWhatsApp}
          handleAssignedtoL2={onAssignedtoL2}
          handleAssignedtoL3={onAssignedtoL3}
          activeTab={activeTab}
          handleFilterChange={handleFilterChange}
          setCallbackType={setCallbackType}
          callbackType={callbackType}
        />

        <Pagination
          totalPages={totalPages}
          handlePageChange={onPageChange}
          currentPage={currentPage}
          leadsPerPage={leadsPerPage}
          totalLeads={totalLeads}
          onLimitChange={onLimitChange}
        />
      </div>


    </>
  );
});

export default LeadsTable;
