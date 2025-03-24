import { Engineering } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export default function OpsertProductionPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Engineering fontSize="large" color="primary" />
        <Typography variant="h4">Offset  Production Dashboard</Typography>
      </Box>
      <Typography variant="body1">
        Welcome to the Offset  Production management page. Monitor and manage all Offset  printing operations from here.
      </Typography>
    </Box>
  );
}