type Props = {
    searchTerm: string;
    setSearchTerm: (searchTerm: string) => void;
};
const Search = (props: Props) => {
    return (
        <div className="search">
            <div>
                <img src="search.svg" alt="search" />

                <input
                    type="text"
                    placeholder="Search through thousands of movies"
                    value={props.searchTerm}
                    onChange={(e) => props.setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
};
export default Search;
