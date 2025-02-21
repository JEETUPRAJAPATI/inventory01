import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import {
  ShoppingCart,
  LocalShipping,
  Person,
  Assignment,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";
import authService from "../../services/authService";

export default function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error("Unauthorized: No token provided");
        }

        const response = await axios.get(
          `${API_BASE_URL}/inventory/recent-activities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Fetched activities:", response.data);
        setActivities(response.data.data || []);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title="Recent Activities"
        sx={{
          "& .MuiCardHeader-title": {
            fontSize: "1.25rem",
            fontWeight: 600,
          },
        }}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>Loading...</Typography>
        ) : activities.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            No recent activities.
          </Typography>
        ) : (
          <List>
            {activities.map((activity, index) => (
              <Box key={activity.id}>
                <ListItem sx={{ px: 3, py: 2 }}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        backgroundColor: (theme) => theme.palette.grey[100],
                        borderRadius: "50%",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.text}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to return the correct icon based on activity type
const getActivityIcon = (type) => {
  switch (type) {
    case "order":
      return <ShoppingCart color="primary" />;
    case "delivery":
      return <LocalShipping color="success" />;
    case "user":
      return <Person color="info" />;
    case "task":
      return <Assignment color="warning" />;
    default:
      return <Assignment color="disabled" />;
  }
};
