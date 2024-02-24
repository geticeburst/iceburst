import axios from "../axios-Header.js";



export const getLogs = async (variables) => {
    const { searchQuery='', page, lazyParams ={} , pageParam = 0 } = variables

    const axiosParams = {
        filter_expression: lazyParams?.searchText || searchQuery,
        page_number: pageParam,
        page_size: 100,
        start_date:lazyParams?.dates?.startDate,
        end_date:lazyParams?.dates?.endDate
    };
    // Check if there are filters in lazyParams
    if (Object.keys(lazyParams?.filters).length > 0) {
        // If filters are present, set is_filter_apply to true
        axiosParams.is_filter_apply = true;

        // Add filter values to the axiosParams
        for (const key in lazyParams.filters) {
            // Check if the key is not empty
            if (key.trim() !== "") {
                axiosParams[key] = lazyParams.filters[key];
            }
        }
    }


    let tmp = await axios.get(`/logs/default`, {
        params: axiosParams,
    })
    let result = tmp.data.result
    return result



}



export const updateNeighborhood = async (updateData) => {
    return axios.patch(`/neighborhood/`, updateData);


}

export const neighborhoodByCityId = async (filters = {}, cityId, fields = 'name,address') => {

    let queryFilters = filters
    const { rows, page, first, searchText, sortField, sortOrder, dates = [] } = queryFilters

    let data = await axios.get(`/neighborhood/${cityId}`, {
        params: {
            search: searchText,
            pageNo: page,
            pageSize: rows,

        },
    })
    let result = data?.data.result
    return result

}

export const neighborhoodDetails = async (NeighborhoodId) => {



    let data = await axios.get(`/neighborhood/detail/id`, { params: { neighborhood_id: NeighborhoodId } })
    let result = data?.data.result
    return result

}

