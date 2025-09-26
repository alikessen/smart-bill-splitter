from src.models.bill import Bill

class BillSplitter:

    @staticmethod
    def split_equally(bill: Bill, num_guests: int) -> dict:
        """Split the bill equally among all guests."""
        total = bill.calculate_total()
        share = total / num_guests
        return {f"Guest {i+1}": round(share, 2) for i in range(num_guests)}

    @staticmethod
    def split_by_item(bill: Bill, guest_items: dict, ordered_items: list) -> dict:
        """
        Split the bill by items consumed.
        guest_items = {
            "Guest 1": { "items": ["2-1"], "shared": {"3-1": 0.5} },
            "Guest 2": { "items": ["2-2"], "shared": {"3-1": 0.5} }
        }
        - Each ordered item has a unique key "itemId-index"
         (e.g. Fish and Chips #1 -> "2-1", Fish and Chips #2 -> "2-2").
        - "items": full items chosen by the guest
        - "shared": dict of {unique_item_key: fraction} for shared items
        """
        subtotal = bill.calculate_subtotal()
        breakdown = bill.breakdown()

        result = {}
        for guest, data in guest_items.items():
            guest_subtotal = 0.0

            # Handle full items
            for key in data.get("items", []):
                if "-" in str(key):
                    item_id, idx = key.split("-")
                    idx = int(idx) - 1
                    # Walk ordered_items and match both id + index
                    count = 0
                    for m in ordered_items:
                        if str(m.item_id) == item_id:
                            count += 1
                            if count == idx + 1:  # match nth occurrence
                                guest_subtotal += m.price
                                break

            # Handle shared items
            for key, fraction in data.get("shared", {}).items():
                if "-" in str(key):
                    item_id, idx = key.split("-")
                    idx = int(idx) - 1
                    count = 0
                    for m in ordered_items:
                        if str(m.item_id) == item_id:
                            count += 1
                            if count == idx + 1:
                                guest_subtotal += m.price * fraction
                                break

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

        # Show overpaid amount
        if remaining < 0:
            result["Overpaid"] = round(abs(remaining), 2)
            result["Remaining"] = 0
        else:
            result["Remaining"] = round(remaining, 2)

        return result