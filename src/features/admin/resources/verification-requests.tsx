import {
  List,
  Datagrid,
  TextField,
  DateField,
  Show,
  SimpleShowLayout,
  ShowButton,
  Button,
  useNotify,
  useRefresh,
  useRecordContext,
} from "react-admin";
import { useTranslation } from "react-i18next";
import { getApiUrl } from "@/shared/lib/utils/api-url";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
};

async function postAdminAction(path: string, body?: any) {
  const token = getAccessToken();
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

function ApproveButton() {
  const record = useRecordContext<any>();
  const notify = useNotify();
  const refresh = useRefresh();
  const { t } = useTranslation("common");

  if (!record) return null;
  if (record.status !== "pending") return null;

  return (
    <Button
      label={t("admin.verificationRequests.approve")}
      onClick={async () => {
        try {
          await postAdminAction(`/admin/verification-requests/${record.id}/approve`);
          notify("OK", { type: "info" });
          refresh();
        } catch {
          notify(t("admin.verificationRequests.actionError"), { type: "warning" });
        }
      }}
    />
  );
}

function RejectButton() {
  const record = useRecordContext<any>();
  const notify = useNotify();
  const refresh = useRefresh();
  const { t } = useTranslation("common");

  if (!record) return null;
  if (record.status !== "pending") return null;

  return (
    <Button
      label={t("admin.verificationRequests.reject")}
      onClick={async () => {
        const adminNote = window.prompt(t("admin.verificationRequests.rejectPrompt")) || "";
        try {
          await postAdminAction(`/admin/verification-requests/${record.id}/reject`, {
            adminNote,
          });
          notify("OK", { type: "info" });
          refresh();
        } catch {
          notify(t("admin.verificationRequests.actionError"), { type: "warning" });
        }
      }}
    />
  );
}

export const VerificationRequestList = () => {
  const { t } = useTranslation("common");
  return (
    <List>
      <Datagrid>
        <TextField source="id" label={t("admin.verificationRequests.id")} />
        <TextField source="status" label={t("admin.verificationRequests.status")} />
        <TextField source="userId" label={t("admin.verificationRequests.userId")} />
        <TextField source="adminId" label={t("admin.verificationRequests.adminId")} />
        <DateField source="createdAt" label={t("admin.verificationRequests.createdAt")} showTime />
        <ShowButton />
        <ApproveButton />
        <RejectButton />
      </Datagrid>
    </List>
  );
};

export const VerificationRequestShow = () => {
  const { t } = useTranslation("common");
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" label={t("admin.verificationRequests.id")} />
        <TextField source="status" label={t("admin.verificationRequests.status")} />
        <TextField source="userId" label={t("admin.verificationRequests.userId")} />
        <TextField source="reason" label={t("admin.verificationRequests.reason")} />
        <TextField source="links" label={t("admin.verificationRequests.links")} />
        <TextField source="adminId" label={t("admin.verificationRequests.adminId")} />
        <TextField source="adminNote" label={t("admin.verificationRequests.adminNote")} />
        <DateField source="createdAt" label={t("admin.verificationRequests.createdAt")} showTime />
        <DateField source="decidedAt" label={t("admin.verificationRequests.decidedAt")} showTime />
      </SimpleShowLayout>
    </Show>
  );
};

