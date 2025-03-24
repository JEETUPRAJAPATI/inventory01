import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Divider,
    Chip,
    Box,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,

} from '@mui/material';
import {
    Assignment,
    LocalShipping,
    Person,
    Business,
    Description,
    DateRange,
    Phone,
    Email,
    Home,
    Inventory,
    DirectionsCar,
} from '@mui/icons-material';

export default function FinishedProductModel({ open, production, onClose }) {

    if (!production || !production.data) {
        return null;
    }

    const productionData = production.data; // Extract correct data object

    const getStatusColor = (status) => {
        const colors = {
            Pending: 'warning',
            'In Transit': 'info',
            Delivered: 'success',
            Cancelled: 'error',
        };
        return colors[status] || 'default';
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>Delivery Details</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {/* Order Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <Assignment />
                                </Avatar>
                            }
                            title="Order Information"
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Order ID
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.order_id || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Order Price
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.orderPrice || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                    <Person />
                                </Avatar>
                            }
                            title="Customer Information"
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Customer Name
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.customerName || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Customer Email
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.email || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Customer Mobile
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.mobileNumber || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.address || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>


                    {/* Production Manager Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    <Business />
                                </Avatar>
                            }
                            title="Production Manager Information"
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                {productionData.unitNumbers && Object.entries(productionData.unitNumbers)
                                    .filter(([key, value]) => value !== "N/A")
                                    .map(([key, value]) => (
                                        <Grid item xs={12} sm={6} key={key}>
                                            <Typography variant="body2" color="text.secondary">
                                                {key.charAt(0).toUpperCase() + key.slice(1)} Unit Number
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {value}
                                            </Typography>
                                        </Grid>
                                    ))}

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Production Status
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.productionManagerDetails?.status || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Progress
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.productionManagerDetails?.production_details?.progress || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Updated At
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.productionManagerDetails?.updatedAt
                                            ? new Date(productionData.productionManagerDetails.updatedAt).toLocaleString()
                                            : 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>


                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    <Inventory /> {/* Updated icon */}
                                </Avatar>
                            }
                            title="Row Materials"
                        />
                        <CardContent>
                            <Grid container spacing={2}>

                                <Grid item xs={12}>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Fabric Color</TableCell>
                                                    <TableCell>Roll Size</TableCell>
                                                    <TableCell>GSM</TableCell>
                                                    <TableCell>Fabric Quality</TableCell>
                                                    <TableCell>Quantity</TableCell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {productionData.productionDetails?.subcategoryIds?.map((subcategory, index) => (
                                                    <TableRow key={subcategory._id}>
                                                        <TableCell>{subcategory._id}</TableCell>
                                                        <TableCell>{subcategory.fabricColor}</TableCell>
                                                        <TableCell>{subcategory.rollSize}</TableCell>
                                                        <TableCell>{subcategory.gsm}</TableCell>
                                                        <TableCell>{subcategory.fabricQuality}</TableCell>
                                                        <TableCell>{subcategory.quantity}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>

                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Bag Details */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                    <Description />
                                </Avatar>
                            }
                            title="Bag Details"
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Bag Type
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.bagDetails?.type || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Handle Color
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.bagDetails?.handleColor || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Size
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.bagDetails?.size || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Color
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.orderDetails?.bagDetails?.color || 'N/A'}
                                    </Typography>
                                </Grid>
                                {productionData.operatorCompleteDate &&
                                    Object.entries(productionData.operatorCompleteDate)
                                        .filter(([key, value]) => value !== "N/A")
                                        .map(([key, value]) => (
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {key.charAt(0).toUpperCase() + key.slice(1)} Completed Date
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {value ? new Date(value).toLocaleString() : 'N/A'}
                                                </Typography>
                                            </Grid>
                                        ))}

                            </Grid>
                        </CardContent>
                    </Card>


                    {/* Delivery Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                    <LocalShipping />
                                </Avatar>
                            }
                            title="Delivery Information"
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Driver Name
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.deliveryDetails?.driverName || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Driver Contact
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.deliveryDetails?.driverContact || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Vehicle No
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.deliveryDetails?.vehicleNo || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Delivery Status
                                    </Typography>
                                    <Chip
                                        label={
                                            productionData.deliveryDetails?.status
                                                ? productionData.deliveryDetails.status.charAt(0).toUpperCase() + productionData.deliveryDetails.status.slice(1)
                                                : 'Unknown'
                                        }
                                        color={getStatusColor(productionData.deliveryDetails?.status)}
                                        size="medium"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Delivery Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {productionData.deliveryDetails?.deliveryDate
                                            ? new Date(productionData.deliveryDetails.deliveryDate).toLocaleString()
                                            : 'N/A'}
                                    </Typography>

                                </Grid>

                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

