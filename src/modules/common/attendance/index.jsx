import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Attendance Module (F23)
 * Clock in/out, daily attendance log, participation rate.
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import DataTable from "../../../shared/ui/DataTable";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import * as attendanceStore from "../../../shared/services/attendanceStore";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

export default function AttendancePage() {
  useDocumentTitle("Attendance");
  const { role } = useRole();
  const currentUser = resolveUser(role);

  const [allRecords, setAllRecords] = useState(() => attendanceStore.listAttendance());
  const [todayAttendance, setTodayAttendance] = useState(
    () => currentUser ? attendanceStore.getTodayAttendance(currentUser.id) : null
  );
  const [participationRate, setParticipationRate] = useState(
    () => attendanceStore.getParticipationRate()
  );
  const reload = useCallback(() => {
    setAllRecords(attendanceStore.listAttendance());
    setTodayAttendance(currentUser ? attendanceStore.getTodayAttendance(currentUser.id) : null);
    setParticipationRate(attendanceStore.getParticipationRate());
  }, [currentUser]);

  const isClockedIn = todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut;

  const handleClockIn = useCallback(() => {
    if (!currentUser) return;
    attendanceStore.clockIn(currentUser.id);
    reload();
  }, [currentUser, reload]);

  const handleClockOut = useCallback(() => {
    if (!currentUser || !todayAttendance) return;
    attendanceStore.clockOut(todayAttendance.id);
    reload();
  }, [currentUser, todayAttendance, reload]);

  const canViewAll = role === "admin" || role === "ceo" || role === "operations";

  const tableData = allRecords.map((r) => {
    const user = userStore.getUserById(r.userId);
    return {
      ...r,
      userName: user?.name || r.userId,
      clockInTime: r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "—",
      clockOutTime: r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—",
      duration: r.clockIn && r.clockOut
        ? `${((new Date(r.clockOut) - new Date(r.clockIn)) / 3600000).toFixed(1)}h`
        : r.clockIn
          ? "In progress"
          : "—",
    };
  });

  return (
    <div>
      <PageSection title="Attendance" subtitle="Daily attendance tracking and participation">
        <Grid cols={4}>
          <MetricCard label="Today's Status" value={isClockedIn ? "Clocked In" : todayAttendance?.clockOut ? "Completed" : "Not Started"} />
          <MetricCard label="Participation Rate" value={`${participationRate}%`} />
          <MetricCard label="Total Records" value={allRecords.length} />
          <MetricCard label="Active Today" value={allRecords.filter((r) => r.date === new Date().toISOString().slice(0, 10) && r.clockIn).length} />
        </Grid>
      </PageSection>

      <PageSection title="My Attendance" subtitle="Clock in and clock out for today">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm">
                {todayAttendance?.clockIn
                  ? `Clocked in at ${new Date(todayAttendance.clockIn).toLocaleTimeString()}`
                  : "You have not clocked in today."}
              </p>
              {todayAttendance?.clockOut && (
                <p className="text-xs text-gray-500 mt-1">
                  Clocked out at {new Date(todayAttendance.clockOut).toLocaleTimeString()} &middot;{" "}
                  {((new Date(todayAttendance.clockOut) - new Date(todayAttendance.clockIn)) / 3600000).toFixed(1)}h
                </p>
              )}
            </div>
            {!todayAttendance?.clockIn && (
              <button
                onClick={handleClockIn}
                className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                Clock In
              </button>
            )}
            {isClockedIn && (
              <button
                onClick={handleClockOut}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Clock Out
              </button>
            )}
            {todayAttendance?.clockOut && (
              <StatusBadge variant="success">Completed</StatusBadge>
            )}
          </div>
        </Card>
      </PageSection>

      {canViewAll && (
        <PageSection title="Attendance Log" subtitle="All attendance records">
          <DataTable
            columns={[
              { key: "userName", label: "Employee" },
              { key: "date", label: "Date" },
              { key: "clockInTime", label: "Clock In" },
              { key: "clockOutTime", label: "Clock Out" },
              { key: "duration", label: "Duration" },
            ]}
            data={tableData}
            pageSize={15}
            emptyText="No attendance records found."
          />
        </PageSection>
      )}
    </div>
  );
}


