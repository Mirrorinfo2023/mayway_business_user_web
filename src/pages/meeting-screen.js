import Layout from "@/components/Dashboard/layout";
import withAuth from "../../utils/withAuth"; // Fixed path
import React from "react";
import MeetingScreen from "@/components/Meeting/Meeting-Screen";

const MeetingPage = () => {
    return (
        <Layout>
            <MeetingScreen />
        </Layout>
    );
};

export default withAuth(MeetingPage);