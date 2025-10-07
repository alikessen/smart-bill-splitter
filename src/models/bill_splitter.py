from src.models.bill import Bill

class BillSplitter:

    # Split the bill equally among all guests
    @staticmethod
    def split_equally(bill: Bill, num_guests: int) -> dict:

        total = bill.calculate_total()
        share = total / num_guests
        return {f"Guest {i+1}": round(share, 2) for i in range(num_guests)}
    


    # Build a lookup table so each ordered item can be accessed quickly
    @staticmethod
    def build_lookup(ordered_items: list) -> dict:

        lookup = {}
        counts = {}
        for m in ordered_items:
            # Track how many times this item has seen 
            counts[m.item_id] = counts.get(m.item_id, 0) + 1

            # Create a unique key for each occurrence
            key = f"{m.item_id}-{counts[m.item_id]}"

            # Store the MenuItem under that key
            lookup[key] = m

        return lookup


    # Split the bill by assigning specific items to guests
    @staticmethod
    def split_by_item(bill: Bill, guest_items: dict, ordered_items: list) -> dict:

        subtotal = bill.calculate_subtotal()
        breakdown = bill.breakdown()

        # Build quick access lookup of ordered items
        lookup = BillSplitter.build_lookup(ordered_items)

        result = {}
        for guest, data in guest_items.items():
            guest_subtotal = 0.0

            # Full items
            for key in data.get("items", []):
                if key in lookup:
                    guest_subtotal += lookup[key].price

            # Add fractional cost of shared items
            for key, fraction in data.get("shared", {}).items():
                if key in lookup:
                    guest_subtotal += lookup[key].price * fraction

            # Proportional extras by share of subtotal
            proportion = guest_subtotal / subtotal if subtotal > 0 else 0
            guest_total = guest_subtotal
            guest_total += breakdown["tax"] * proportion
            guest_total += breakdown["service"] * proportion
            guest_total += breakdown["tip"] * proportion

            result[guest] = round(guest_total, 2)

        return result


    # Split the bill by custom amounts
    @staticmethod
    def split_by_amount(bill: Bill, contributions: dict) -> dict:

        total = bill.calculate_total()
        paid = sum(contributions.values())
        remaining = total - paid

        result = {guest: round(amount, 2) for guest, amount in contributions.items()}

        # Show overpaid or remaining amount
        if remaining < 0:
            result["Overpaid"] = round(abs(remaining), 2)
            result["Remaining"] = 0
        else:
            result["Remaining"] = round(remaining, 2)

        return result