from src.models.bill import Bill

class BillSplitter:

    # Split the bill equally among all guests
    @staticmethod
    def split_equally(bill: Bill, num_guests: int) -> dict:

        #total = bill.calculate_total()
        #share = total / num_guests
        #return {f"Guest {i+1}": round(share, 2) for i in range(num_guests)}
    
        bill.calculate_components()

        subtotal_share = bill.subtotal / num_guests
        tax_share = bill.tax / num_guests
        service_share = bill.service / num_guests
        tip_share = bill.tip / num_guests
        total_share = bill.total / num_guests

        result = {}
        for i in range(num_guests):
            result[f"Guest {i + 1}"] = {
                "subtotal": round(subtotal_share, 2),
                "tax": round(tax_share, 2),
                "service": round(service_share, 2),
                "tip": round(tip_share, 2),
                "total": round(total_share, 2)
            }
        return result



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
            

            # Proportional extras
            proportion = guest_subtotal / subtotal if subtotal > 0 else 0
            guest_tax = breakdown["tax"] * proportion
            guest_service = breakdown["service"] * proportion
            guest_tip = breakdown["tip"] * proportion
            guest_total = guest_subtotal + guest_tax + guest_service + guest_tip

            # return full detailed object
            result[guest] = {
                "subtotal": round(guest_subtotal, 2),
                "tax": round(guest_tax, 2),
                "service": round(guest_service, 2),
                "tip": round(guest_tip, 2),
                "total": round(guest_total, 2)
            }

        return result
        

    # Split the bill by custom amounts
    @staticmethod
    def split_by_amount(bill: Bill, contributions: dict) -> dict:
        
        bill.calculate_components()
        total_bill = bill.total
        total_contributed = sum(contributions.values())

        if total_contributed <= 0:
            return {"error": "Invalid total amount"}

        result = {}

        for guest, amount in contributions.items():
            ratio = amount / total_contributed

            subtotal = bill.subtotal * ratio
            tax = bill.tax * ratio
            service = bill.service * ratio
            tip = bill.tip * ratio
            total = bill.total * ratio

            result[guest] = {
                "subtotal": round(subtotal, 2),
                "tax": round(tax, 2),
                "service": round(service, 2),
                "tip": round(tip, 2),
                "total": round(total, 2)
            }

        # calculate leftover or excess payment
        remaining = total_bill - total_contributed
        result["Summary"] = {
            "Total Bill": round(total_bill, 2),
            "Total Contributed": round(total_contributed, 2),
            "Remaining": round(remaining, 2) if remaining > 0 else 0.0,
            #"Overpaid": abs(round(remaining, 2)) if remaining < 0 else 0.0         # No need at the moment as there is no option to pay more than bill
        }

        return result
    