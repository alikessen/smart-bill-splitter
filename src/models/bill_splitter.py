from src.models.bill import Bill

class BillSplitter:

    @staticmethod
    def split_equally(bill: Bill, num_guests: int) -> dict:
        """Split the bill equally among all guests."""
        total = bill.calculate_total()
        share = total / num_guests
        return {f"Guest {i+1}": round(share, 2) for i in range(num_guests)}

    @staticmethod
    def split_by_item(bill: Bill, guest_items: dict, menu: list) -> dict:
        """
        Split the bill by items consumed.
        guest_items = {
            "Guest 1": { "items": [2, 5], "shared": {1: 0.5} },
            "Guest 2": { "items": [3, 4], "shared": {1: 0.5} }
        }
        - "items": full items chosen by the guest (list of IDs)
        - "shared": dict of {item_id: fraction} for shared items
        """
        subtotal = bill.calculate_subtotal()
        breakdown = bill.breakdown()

        result = {}
        for guest, data in guest_items.items():
            # Normal items
            guest_subtotal = sum(m.price for m in menu if m.item_id in data.get("items", []))

            # Shared items
            for item_id, fraction in data.get("shared", {}).items():
                for m in menu:
                    if m.item_id == item_id:
                        guest_subtotal += m.price * fraction

            # Proportional charges
            proportion = guest_subtotal / subtotal if subtotal > 0 else 0
            guest_total = guest_subtotal
            guest_total += breakdown["tax"] * proportion
            guest_total += breakdown["service"] * proportion
            guest_total += breakdown["tip"] * proportion

            result[guest] = round(guest_total, 2)

        return result

    @staticmethod
    def split_by_amount(bill: Bill, contributions: dict) -> dict:
        """
        Split the bill by custom amounts.
        contributions = {
            "Guest 1": 50,
            "Guest 2": 75
        }
        The function returns each guest's contribution and the remaining balance.
        """
        total = bill.calculate_total()
        paid = sum(contributions.values())
        remaining = total - paid

        result = {guest: round(amount, 2) for guest, amount in contributions.items()}
        result["Remaining"] = round(remaining, 2)
        return result
