import { Card, CardContent, Typography, Box } from "@mui/material";
import { TrendingUp, TrendingDown, CurrencyRupee } from "@mui/icons-material";

export default function SummaryCard({
  title,
  value,
  changeFromLastMonth,
  color,
}) {
  const isAmountCard = title.toLowerCase().includes("amount");

  // Ensure changeFromLastMonth is a string like "5036.26%" or "-60%"
  const change =
    typeof changeFromLastMonth === "string"
      ? parseFloat(changeFromLastMonth)
      : 0;
  const isNegative = change < 0;
  const isZero = change === 0;
  const isPositive = change > 0;

  // Safely format the value
  const displayValue = isAmountCard
    ? typeof value === "string" || typeof value === "number"
      ? value.toString().replace("₹", "")
      : "0"
    : value ?? "0";
  console.log(">>>>", title);
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100px",
          height: "100px",
          background: (theme) => `${theme.palette[color]?.main}15`,
          borderRadius: "50%",
          transform: "translate(30%, -30%)",
        }}
      />
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{ mb: 1, display: "flex", alignItems: "center" }}
        >
          {isAmountCard && <CurrencyRupee sx={{ fontSize: 24, mr: 0.5 }} />}
          {displayValue}
        </Typography>

        {changeFromLastMonth && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isPositive && <TrendingUp color="success" sx={{ mr: 0.5 }} />}
            {isNegative && <TrendingDown color="error" sx={{ mr: 0.5 }} />}
            {isZero && null}
            <Typography
              variant="body2"
              color={
                isPositive
                  ? "success.main"
                  : isNegative
                  ? "error.main"
                  : "text.secondary"
              }
            >
              {title.includes("Amount")
                ? `₹${Math.abs(Math.round(change))} from last month`
                : `${Math.abs(Math.round(change))}% from last month`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
