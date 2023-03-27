function Input() {
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <input type="text" placeholder="Your message..." />
                <div className="wrapper">
                    <div className="icon micro"></div>
                    <label htmlFor="image" className="icon image"></label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        style={{ display: "none" }}
                        accept="image/png, image/gif, image/jpeg"
                    />
                    <div className="send-wrapper">
                        <div className="icon send"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Input;
