import React from 'react';
import ReactDOM from 'react-dom';

type Bookmark = chrome.bookmarks.BookmarkTreeNode;

interface State {
  bookmarks: Bookmark[]
}

class Bookmarks extends React.Component<any, State> {

  public async componentDidMount() {

    const bookmarks: Bookmark[] = await new Promise((resolve) => chrome.bookmarks.getTree(bookmarks => resolve(bookmarks[0]?.children[0]?.children as any)));

    console.log(bookmarks);

    this.setState({ bookmarks });
  }

  public render() {

    return (
      <div className="d-flex align-items-center h-100 ">
        {this.state?.bookmarks && <div className="mx-auto">
          <h3>Favorites</h3>
          {this.renderBookmarksRecursive(this.state.bookmarks)}
        </div>}
      </div>
    );
  }

  private renderBookmarksRecursive(bookmarks: Bookmark[]) {

    return (
      <div className="d-flex">

        {bookmarks?.map(bookmark => (
          <a href={bookmark.url} className="text-decoration-none mr-3">

            <div className="d-flex align-items-center border rounded mb-2" style={{ height: 100, width: 100 }}>
              {bookmark.url && <img className="mx-auto" height="24" width="24" src={`http://www.google.com/s2/favicons?domain=${bookmark.url}`} />}
            </div>

            <div className="text-dark text-center">{bookmark.title}</div>
          </a>
        ))}
      </div>
    );
  }

}

ReactDOM.render(<Bookmarks />, document.getElementById('app'));
