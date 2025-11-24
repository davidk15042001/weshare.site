import ProfilePicture from "./ProfilePicture"

export default function MessageBox({color, avatar, user}){

    

    const messages = {
        messageId: "",
        messagesText: [
            {userId: 1,
            message: 'fooo'},
            
            {userId: 2,
            message: 'fooo'},
        ]
    }

    return(
        <div className="position-absolute" style={{bottom: 0, right: '25px', backgroundColor: 'white', borderTopRightRadius: '8px', borderTopLeftRadius: '8px'}}>
            <div className="messageBoxHeader d-flex gap-3 p-2" style={{backgroundColor: color, borderTopRightRadius: '8px', borderTopLeftRadius: '8px'}}>
                <ProfilePicture
                    profileImg={avatar}
                    size={45}
                    style={{
                        alignSelf: "center",
                    }}
                />
                <div>
                <h4>
                    Chat bot
                </h4>
                </div>
            </div>

            <div className="messageBoxBody p-3">
                {
                    messages.messagesText.map(text =>{
                        return (
                            <p style={{ textAlign: user === text.userId ? 'end' : 'start' }}>
                                {text.message}
                            </p>
                        )
                    })
                }
            </div>
        </div>
    )
}