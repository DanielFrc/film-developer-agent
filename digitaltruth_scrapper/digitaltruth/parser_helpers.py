from bs4 import BeautifulSoup


def get_input_from_content(
    html_content: str, element_type: str, element_id: str, element_to_find: str
) -> list | None:

    soup = BeautifulSoup(html_content, "html.parser")
    select_input = soup.find(element_type, id=element_id)

    return select_input.find_all(element_to_find) if select_input else None


def get_table_from_content(
    html_content: str, element_type: str, element_class: str, element_to_find: str
) -> list | None:

    soup = BeautifulSoup(html_content, "html.parser")
    table = soup.find(element_type, class_=element_class)
    rows = table.find_all(element_to_find)[1:] if table else []

    return rows
