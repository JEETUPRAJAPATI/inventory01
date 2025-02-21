import { Card, CardContent, CardHeader, Box } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function ChartCard({ data }) {
  console.log('Chart Data:', data);

  return (
    <Card>
      <CardHeader
        title="Revenue & Orders Overview"
        sx={{ '& .MuiCardHeader-title': { fontSize: '1.25rem', fontWeight: 600 } }}
      />
      <CardContent>
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Orders', angle: -90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
