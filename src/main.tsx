import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './main.css';

/** Simplify type name */
type Bookmark = chrome.bookmarks.BookmarkTreeNode;

/** State for bookmark component. Will start as null. */
interface State {
  bookmarks: Bookmark[];
  selectedFolder: Bookmark;

  bookmarksAsFlatList: Bookmark[];
  searchQuery: string;
}

class Bookmarks extends React.Component<any, State> {

  /** Load bookmarks on init. */
  public async componentDidMount() {
    const bookmarks: Bookmark[] = await new Promise(resolve => chrome.bookmarks.getTree(resolve));

    // This assumes the "Bookmarks bar" entry is placed first. "Other bookmarks" is not used.
    this.setState({
      bookmarks: bookmarks[0]?.children[0]?.children,
      bookmarksAsFlatList: this.flattenBookmarksRecursive([], bookmarks),
    });

    // navigate on hash change
    window.onhashchange = () => {
      const id = window.location.hash?.replace('#', '');

      // set or clear
      const bookmark = this.state.bookmarks.find(b => b.id === id);
      this.setState({ selectedFolder: bookmark });
    };
  }

  private flattenBookmarksRecursive(all: Bookmark[], current: Bookmark[]): Bookmark[] {
    current.forEach(b => {
      all.push(b);

      b.children?.length && this.flattenBookmarksRecursive(all, b.children);
    });

    return all;
  }

  public render() {
    return (
      <div className="h-100">
        <div className='d-flex align-items-center h-75 container'>

          {this.state?.bookmarks && <div>

            <div className='d-flex align-items-center mb-3' onClick={event => this.openFolder(event, null)}>
              <h3 className='mb-0'>{this.state?.selectedFolder?.title || 'Bookmarks'}</h3>
              {this.state?.selectedFolder && <button type='button' className='btn btn-dark ml-2'>Back</button>}
            </div>

            {this.state.bookmarksAsFlatList?.length > 0 && <div className="mb-3 border p-2">
              <input type="text"
                className="w-100 border-0"
                placeholder="Search"
                value={this.state.searchQuery}
                onChange={event => this.setState({ searchQuery: event.target.value })}
                onKeyDown={event => event.key === 'Enter' && window.location.assign((document.querySelector('.search-result') as HTMLAnchorElement).href)} />
            </div>}

            {this.state.searchQuery && <div className="mb-3">
              {this.state.bookmarksAsFlatList.filter(b => b.title.toLowerCase().includes(this.state.searchQuery.toLowerCase())).map((b, index) => (
                <a className="search-result d-flex align-items-center text-decoration-none mb-1" href={b.url}>
                  <img className="mr-2" height='20' width='20' src={`http://www.google.com/s2/favicons?domain=${b.url}`} />
                  <div className={index ? 'text-body' : 'text-accent'}>{b.title}</div>
                </a>
              ))}
            </div>}

            <div className='row m-0 flex-wrap'>

              {!this.state.bookmarks.length && <div className='text-muted'>You have no bookmarks</div>}

              {(this.state?.selectedFolder?.children || this.state.bookmarks)?.map(bookmark => (
                <a role="button" href={bookmark.url} className='text-decoration-none mr-3 mb-4' >

                  <div className='d-flex align-items-center border rounded mb-2' style={{
                    height: 100,
                    width: 100,
                  }} onClick={event => this.openFolder(event, bookmark)}>
                    {bookmark.url && <img className='mx-auto' height='24' width='24' src={`http://www.google.com/s2/favicons?domain=${bookmark.url}`} />}
                    {!bookmark.url && <div className='d-flex flex-wrap p-1'>
                      {bookmark.children.map(b => <img className='mr-1 mb-1' height='16' width='16' src={`http://www.google.com/s2/favicons?domain=${b.url}`} />)}
                    </div>}
                  </div>

                  <small className='d-block text-dark text-center text-wrap' style={{ width: 100 }}>{bookmark.title}</small>
                </a>
              ))}
            </div>

          </div>}
        </div>
      </div>
    );
  }

  /**
   * Choose which folder to view.
   * @param event used to stop event bubbling
   * @param bookmark technically a folder
   */
  private openFolder(event: React.MouseEvent, bookmark: Bookmark): void {

    // if the bookmark has an url, it is not a folder and normal click events should be applied
    if (bookmark?.url) {
      return;
    }

    // prevent click bubbling
    event?.preventDefault();

    // update window state - this will in turn trigger navigation
    window.location.hash = bookmark?.id || '';
  }

}

/** Start app  */
ReactDOM.render(<Bookmarks />, document.getElementById('app'));
