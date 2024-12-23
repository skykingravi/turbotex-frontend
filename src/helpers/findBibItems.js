import axios from "axios";

const mandatoryFields = {
    article: ["author", "title", "journal", "year"],
    book: ["author", "title", "publisher", "year"],
    inbook: ["author", "title", "pages", "publisher", "year"],
    incollection: ["author", "title", "booktitle", "publisher", "year"],
    conference: ["author", "title", "booktitle", "year"],
    inproceedings: ["author", "title", "booktitle", "year"],
    manual: ["title"],
    mastersthesis: ["author", "title", "school", "year"],
    phdthesis: ["author", "title", "school", "year"],
    proceedings: ["title", "year"],
    techreport: ["author", "title", "institution", "year"],
    unpublished: ["author", "title", "note"],
};

export const findBibItems = async (url, filename = "") => {
    const BIBITEMS = {};
    const AUTHORS = {};
    try {
        const response = await axios.post(`${url}/findBibItems`, {
            file: filename,
        });

        const entries = response.data ?? [];
        entries.forEach((val) => {
            const citeId = val["key"];
            const obj = {};
            Object.entries(val).forEach((v) => {
                const k = v[0].toLowerCase();
                if (k === "author") {
                    const authors = v[1]
                        .split(/and/i)
                        .map((segment) => segment.trim());
                    authors.forEach((name) => {
                        if (AUTHORS[name] === undefined) AUTHORS[name] = [];
                        AUTHORS[name].push(citeId);
                    });
                    obj[k] = authors;
                } else if (k !== "key") {
                    obj[k] = v[1];
                }
            });
            let arr = [];
            const fields = Object.keys(obj);
            mandatoryFields[obj["type"]].forEach((f) => {
                if (!fields.includes(f)) arr.push(f);
            });
            obj.missing = arr;
            BIBITEMS[citeId] = obj;
        });
    } catch (err) {
        console.error(err);
    }

    return [BIBITEMS, AUTHORS];
};
