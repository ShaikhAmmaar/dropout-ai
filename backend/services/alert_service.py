class AlertService:
    @staticmethod
    def trigger_intervention(student_name: str) -> str:
        # In production, this would send an email/Slack/SMS to a counselor
        msg = f"ALERT: Immediate intervention required for {student_name}. High dropout risk detected."
        print(msg)
        return msg

    @staticmethod
    def trigger_crisis_alert(student_name: str) -> str:
        msg = f"EMERGENCY ALERT: Mental health crisis detected for {student_name}."
        print(msg)
        return msg

alert_service = AlertService()