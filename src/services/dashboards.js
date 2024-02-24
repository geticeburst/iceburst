import LocalStorageService from "../utils/utils";
import supabase from "../utils/supabaseClient";

export async function fetchDashboardData(queryParam) {
  const { selectedDashboard } = queryParam;
  console.log("dashboardName", selectedDashboard);
  const dashboards = LocalStorageService.get("dashboards") || {};
  console.log("dashboards from api", dashboards);
  console.log("dashboards[dashboardName] ", dashboards[selectedDashboard]);
  return dashboards[selectedDashboard] || null;
}

export async function fetchDashboardNames() {
  const dashboards = LocalStorageService.get("dashboards") || {};

  const { data, error } = await supabase
    .from("custom_dashboard")
    .select("*")
    .eq("user_id", "1d6e1cdf-a59d-4f8a-8156-aa880a28ed48");

  console.log("data", data, error);
  return data;
}

export async function addDashboard(finalData) {
  const result = await supabase.from("custom_dashboard").insert([finalData]);

  return result;
}

export async function updateDashboard(id, updatedData) {
  // Assuming `updatedData` contains the updated values for a specific record
  const data = await supabase
    .from("custom_dashboard")
    .update({ ...updatedData })
    .match({ id: id });

  if (error) {
    throw Error(`Failed to update record: ${error}`);
  }

  return data; // Return the first matched record after successful update
}

export async function deleteDashboardRecord(recordId) {
  const data = await supabase
    .from("custom_dashboard")
    .delete()
    .match({ id: recordId });

  if (data?.error) {
    throw Error(`Failed to delete record: ${error}`);
  }

  return data; // Return the deleted record
}
