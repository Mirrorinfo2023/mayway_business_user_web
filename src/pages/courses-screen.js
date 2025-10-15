import Layout from "@/components/Dashboard/layout";
import withAuth from "../../utils/withAuth";
import React from "react";
import CoursesScreen from "@/components/Courses/Courses-Screen";

const CoursesPage = () => {
    return (
        <Layout>
            <CoursesScreen />
        </Layout>
    );
};

export default withAuth(CoursesPage);