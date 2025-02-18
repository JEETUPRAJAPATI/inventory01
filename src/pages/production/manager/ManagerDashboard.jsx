import { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import SummaryCard from '../../../components/dashboard/SummaryCard';
import ProductionOverview from '../../../components/admin/ProductionOverview';
import InventoryOverview from '../../../components/admin/InventoryOverview';

import flexoService from '../../../services/flexoService.js';
import OrderService from '../../../services/productionManagerService.js';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalProduction: 0,
    activeOrders: 0,
    completedToday: 0,
    efficiencyRate: "N/A",
  });

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        const flexo = await flexoService.getRecords();
        const opsert = await OrderService.getDCutOpsert('');
        const dcut = await OrderService.getDCutBagMaking('');
        const wcut = await OrderService.getWCutBagMaking('');

        // Total Orders for each type
        const totalFlexo = flexo?.data?.length || 0;
        const totalOpsert = opsert?.data?.length || 0;
        const totalDCut = dcut?.data?.length || 0;
        const totalWCut = wcut?.data?.length || 0;
        const totalProduction = totalFlexo + totalOpsert + totalDCut + totalWCut;

        // Completed Orders for each type
        const completedFlexo = flexo?.data?.filter(order => order.status === 'completed')?.length || 0;
        const completedOpsert = opsert?.data?.filter(order => order.status === 'completed')?.length || 0;
        const completedDCut = dcut?.data?.filter(order => order.status === 'completed')?.length || 0;
        const completedWCut = wcut?.data?.filter(order => order.status === 'delivered')?.length || 0;
        const completedToday = completedFlexo + completedOpsert + completedDCut + completedWCut;

        // Active Orders (in_progress)
        const activeFlexo = flexo?.data?.filter(order => order.status === 'in_progress')?.length || 0;
        const activeOpsert = opsert?.data?.filter(order => order.status === 'in_progress')?.length || 0;
        const activeDCut = dcut?.data?.filter(order => order.status === 'in_progress')?.length || 0;
        const activeWCut = wcut?.data?.filter(order => order.status === 'in_progress')?.length || 0;
        const activeOrders = activeFlexo + activeOpsert + activeDCut + activeWCut;

        // Corrected Efficiency Calculation
        const totalCompletedOrders = completedToday;
        const efficiencyRate = totalProduction > 0
          ? ((totalCompletedOrders / totalProduction) * 100).toFixed(2) + "%"
          : "N/A";

        setStats({ totalProduction, activeOrders, completedToday, efficiencyRate });
      } catch (error) {
        console.error('Error fetching production data:', error);
      }
    };

    fetchProductionData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Total Production"
          value={stats.totalProduction}
          increase="+8%" // Ideally, this should be dynamic
          color="primary"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Active Orders"
          value={stats.activeOrders}
          increase="+12%" // Placeholder
          color="warning"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Completed Today"
          value={stats.completedToday}
          increase="+15%" // Placeholder
          color="success"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Efficiency Rate"
          value={stats.efficiencyRate}
          increase="+2%" // Placeholder
          color="info"
        />
      </Grid>

      <Grid item xs={12}>
        <ProductionOverview />
      </Grid>
      <Grid item xs={12}>
        <InventoryOverview />
      </Grid>
    </Grid>
  );
}
