import React from "react";
import Business from "../components/Business/business";
import DashboardLayout from "../components/Dashboard/layout";
import withAuth from "../../utils/withAuth";

const BusinessPage = () => {
    return (
        <DashboardLayout>
            <Business />
        </DashboardLayout>
    );
}

export default withAuth(BusinessPage);