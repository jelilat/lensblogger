

// timeAgo Function
export function TimeAgo(epochtime: any) {
    const currentTime = new Date();
    const diff = (currentTime.getTime() - epochtime) / 1000;

    if (diff < 5) {
        return 'now';
    } else if (diff < 60) {
        return 'less than a minute ago';
    } else if (diff < 3600) {
        return Math.round(diff / 60) + ' minutes ago';
    } else if (diff < 86400) {
        return Math.round(diff / 3600) + ' hours ago';
    } else if (diff < 604800) {
        if (Math.round(diff / 86400) < 2) {
            return '1 day ago';
        }
        return Math.round(diff / 86400) + ' days ago';
    } else if (diff < 2419200) {
        return Math.round(diff / 604800) + ' weeks ago';
    } else if (diff > 2419200) {
        return Math.round(diff / 2419200) + ' months ago';
    } return ''
};