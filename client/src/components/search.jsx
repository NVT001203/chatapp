import SearchIcon from "../imgs/search.png";

function Search() {
    return (
        <div className="search">
            <img src={SearchIcon} />
            <input type="text" placeholder="Search..." />
        </div>
    );
}

export default Search;
