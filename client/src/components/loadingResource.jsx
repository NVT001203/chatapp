import Loading from "../imgs/Loading.gif";

function LoadingResource() {
    return (
        <div className="fetch-container">
            <img src={Loading} />
            <h3>Loading resource...</h3>
        </div>
    );
}

export default LoadingResource;
