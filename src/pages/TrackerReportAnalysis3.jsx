import React, { useState, useEffect } from 'react'
import { BASE_URL } from '../config/api'
import { FiFilter, FiCalendar, FiX, FiRefreshCw } from 'react-icons/fi'
import DashboardHeader from '../components/MainReport/DashboardHeader';

const TrackerReportAnalysis3 = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
  })
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    setShowFilterDrawer(false)

    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(
        `${BASE_URL}/studentcoursestatus/report3?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        setData(result)
      } else {
        setError(result.message || 'Failed to fetch report')
      }
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetToToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setFilters({
      from_date: today,
      to_date: today,
    })
    setTimeout(fetchReport, 100)
  }

  const setLast7Days = () => {
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 7)

    setFilters({
      from_date: lastWeek.toISOString().split('T')[0],
      to_date: today.toISOString().split('T')[0],
    })
    setTimeout(fetchReport, 100)
  }

  const setThisMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

    setFilters({
      from_date: firstDay.toISOString().split('T')[0],
      to_date: today.toISOString().split('T')[0],
    })
    setTimeout(fetchReport, 100)
  }

  const getFieldData = (attributeCounts) => {
    if (!attributeCounts) return {}

    return {
      ageCount: attributeCounts.student_age?.['Has Data'] || 0,
      objectiveCount: attributeCounts.objective?.['Has Data'] || 0,
      degreeCount: attributeCounts.highest_degree?.['Has Data'] || 0,
      completionYearCount: attributeCounts.completion_year?.['Has Data'] || 0,
      professionCount: attributeCounts.current_profession?.['Has Data'] || 0,
      roleCount: attributeCounts.current_role?.['Has Data'] || 0,
      experienceCount: attributeCounts.work_experience?.['Has Data'] || 0,
      budgetCount: attributeCounts.preferred_budget?.['Has Data'] || 0,
      preferredDegreeCount: attributeCounts.preferred_degree?.['Has Data'] || 0,
      preferredLevelCount: attributeCounts.preferred_level?.['Has Data'] || 0,
      specializationCount: attributeCounts.preferred_specialization?.['Has Data'] || 0,
      cityCount: attributeCounts.student_current_city?.['Has Data'] || 0,
      stateCount: attributeCounts.student_current_state?.['Has Data'] || 0,
    }
  }

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500">
      <div className=" mx-auto py-2">
        <DashboardHeader 
          title="Attribute Insights Panel"
          actions={
            <>
              <button
                  onClick={fetchReport}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100/50 font-bold text-xs shadow-sm"
              >
                  <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  REFRESH
              </button>
              <button
                  onClick={() => setShowFilterDrawer(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all font-bold text-xs shadow-sm"
              >
                  <FiFilter size={14} />
                  FILTERS
              </button>
            </>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-in shake duration-500">
            <div className="font-bold flex items-center gap-2 mb-1 uppercase tracking-tight text-xs">
              <FiX className="w-4 h-4" />
              Analysis Error
            </div>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600" />
          </div>
        )}

      

        {data && !loading && data.totalFirstTimeICCLeads > 0 ? (
          <div className="border border-slate-200 bg-white rounded-xl">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full  text-sm text-left text-slate-800 border-collapse rounded-xl">
                <thead className="bg-blue-600 text-white border-b border-blue-700 rounded-xl">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Counsellor
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Total Leads
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap bg-blue-700">
                      Overall %
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Age
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Objective
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Degree
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Comp. Year
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Profession
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Role
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Experience
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Budget
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Pref. Degree
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Pref. Level
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      Specialization
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      City
                    </th>
                    <th className="px-6 py-3 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                      State
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.supervisorGroups.map((group) => (
                    <React.Fragment key={group.supervisorId}>
                      <tr className="bg-blue-100 border-t border-slate-200">
                        <td className="px-6 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                          {group.supervisorName}
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-700 whitespace-nowrap">
                          {group.counsellors.length} counsellor(s)
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-center whitespace-nowrap">
                          {group.supervisorTotalLeads}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-center whitespace-nowrap bg-blue-200">
                          {group.supervisorTotalPercentage}%
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.student_age?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.objective?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.highest_degree?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.completion_year?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.current_profession?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.current_role?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.work_experience?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.preferred_budget?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.preferred_degree?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.preferred_level?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.preferred_specialization?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.student_current_city?.hasData || 0}
                        </td>
                        <td className="px-6 py-3 text-center font-bold bg-blue-50">
                          {group.supervisorAttributeCounts?.student_current_state?.hasData || 0}
                        </td>
                      </tr>

                      {group.counsellors.map((counsellor, idx) => {
                        const fieldData = getFieldData(counsellor.attributeCounts)

                        return (
                          <tr
                            key={counsellor.counsellorId}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                          >
                            <td className="px-6 py-3 whitespace-nowrap" />
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="font-medium">
                                {counsellor.counsellorName}
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-semibold">
                              {counsellor.totalCounsellingLeads}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-bold bg-blue-50">
                              {counsellor.overallPercentage || 0}%
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.ageCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.objectiveCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.degreeCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.completionYearCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.professionCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.roleCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.experienceCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.budgetCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.preferredDegreeCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.preferredLevelCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.specializationCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.cityCount}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-center font-medium">
                              {fieldData.stateCount}
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          data &&
          !loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 text-sm">
              <div className="font-semibold">No Data Found</div>
              <p className="text-xs mt-1">
                No first time ICC leads found for {filters.from_date} to {filters.to_date}.
                Try selecting a different date range.
              </p>
            </div>
          )
        )}

        {showFilterDrawer && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilterDrawer(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 md:w-96 bg-white border-l border-slate-200">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FiFilter className="w-5 h-5 text-slate-600" />
                    <h2 className="text-lg font-semibold text-slate-800">
                      Date Filters
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-1.5 hover:bg-slate-100"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">
                      Quick Presets
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={resetToToday}
                        className="px-4 py-2 text-left text-sm bg-slate-100 hover:bg-slate-200"
                      >
                        Today
                      </button>
                      <button
                        onClick={setLast7Days}
                        className="px-4 py-2 text-left text-sm bg-slate-100 hover:bg-slate-200"
                      >
                        Last 7 Days
                      </button>
                      <button
                        onClick={setThisMonth}
                        className="px-4 py-2 text-left text-sm bg-slate-100 hover:bg-slate-200"
                      >
                        This Month
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">
                      Custom Range
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          From Date
                        </label>
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleDateChange}
                            className="flex-1 px-3 py-2 border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          To Date
                        </label>
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleDateChange}
                            min={filters.from_date}
                            className="flex-1 px-3 py-2 border border-slate-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  
                </div>

                <div className="p-4 border-t border-slate-200">
                  <button
                    onClick={fetchReport}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Applying...' : 'Apply Filters'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackerReportAnalysis3
  