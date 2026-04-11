import Link from "next/link";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";
import { AppBar, Layout, TitlePortal } from "react-admin";
import type { LayoutProps } from "react-admin";

function AdminRaAppBar() {
    const { t } = useTranslation("common");
    return (<AppBar>
      <TitlePortal />
      <Button component={Link} href="/profile" color="inherit" size="small" sx={{
            textTransform: "none",
            ml: 0.5,
        }}>
        {t("admin.backToProfile")}
      </Button>
    </AppBar>);
}

export function AdminRaLayout(props: LayoutProps) {
    return <Layout {...props} appBar={AdminRaAppBar}/>;
}
