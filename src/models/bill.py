from src.models.table import Table

class Bill:
    def __init__(self, table: Table, tax_rate=0.20, service_rate=0.15, tip_rate=0.10):
        self.table = table
        self.tax_rate = tax_rate
        self.service_rate = service_rate
        self.tip_rate = tip_rate

        # component values
        self.subtotal = 0.0
        self.tax = 0.0
        self.service = 0.0
        self.tip = 0.0
        self.total = 0.0

        self.calculate_components()

    def calculate_components(self):
        self.subtotal = self.table.calculate_subtotal()
        self.tax = self.subtotal * self.tax_rate
        self.service = self.subtotal * self.service_rate
        self.tip = self.subtotal * self.tip_rate
        self.total = self.subtotal + self.tax + self.service + self.tip


    # Subtotal = sum of all orders at the table (before charges)
    def calculate_subtotal(self) -> float:
        return self.table.calculate_subtotal()

    # Final total = subtotal + tax + service + tip
    def calculate_total(self) -> float:
        subtotal = self.calculate_subtotal()
        tax = subtotal * self.tax_rate
        service = subtotal * self.service_rate
        tip = subtotal * self.tip_rate
        return subtotal + tax + service + tip

    # Return detailed breakdown as a dictionary
    def breakdown(self) -> dict:
        self.calculate_components()
        return {
            "subtotal": round(self.subtotal, 2),
            "tax": round(self.tax, 2),
            "service": round(self.service, 2),
            "tip": round(self.tip, 2),
            "total": round(self.total, 2),
        }

    def __str__(self):
        breakdown = self.breakdown()
        return (
            f"Subtotal: ${breakdown['subtotal']:.2f}\n"
            f"Tax: ${breakdown['tax']:.2f}\n"
            f"Service Charge: ${breakdown['service']:.2f}\n"
            f"Tip: ${breakdown['tip']:.2f}\n"
            f"Total: ${breakdown['total']:.2f}"
        )
