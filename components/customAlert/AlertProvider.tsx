import React, {useState} from "react"
import {CustomAlert, setAlertInstance} from "./CustomAlert"

interface AlertProps {
    title: string
    message?: string
    buttons?: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>
    type?: "success" | "error" | "info" | "warning" | "confirm"
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [alertProps, setAlertProps] = useState<AlertProps | null>(null)
    const [visible, setVisible] = useState(false)

    React.useEffect(() => {
        setAlertInstance((props: AlertProps) => {
            setAlertProps(props)
            setVisible(true)
        })
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(() => setAlertProps(null), 300)
    }

    return (
        <>
            {children}
            {alertProps && (
                <CustomAlert
                    visible={visible}
                    title={alertProps.title}
                    message={alertProps.message}
                    buttons={alertProps.buttons}
                    type={alertProps.type}
                    onClose={handleClose}
                />
            )}
        </>
    )
}
