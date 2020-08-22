
const search = function (idx, keyword) {
  return idx.search(keyword || '', {
    fields: {
      title: { boost: 1 },
      content: { boost: 2 }
    },
    bool: "AND",
    expand: false
  });
}

exports.search = search;
